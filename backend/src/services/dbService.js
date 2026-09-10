const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const logger = require('../utils/logger');
const Mutex = require('../utils/Mutex');

const MAX_BACKUPS = 50;

const SCHEMAS = {
  Users: ['id', 'username', 'password_hash', 'role', 'created_at', 'updated_at'],
  Expenses: ['id', 'date', 'amount', 'description', 'category', 'upi_transaction', 'created_by', 'created_at', 'updated_by', 'updated_at'],
  Income: ['id', 'date', 'amount', 'description', 'created_by', 'created_at', 'updated_by', 'updated_at'],
  Savings: ['id', 'date', 'amount', 'source', 'created_by', 'created_at', 'updated_at', 'description'],
  SavingsGoals: ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'created_by', 'created_at', 'updated_at'],
  Budgets: ['id', 'category', 'month', 'year', 'amount', 'created_by', 'created_at', 'updated_at'],
  Investments: ['id', 'type', 'asset_name', 'amount', 'purchase_date', 'current_value', 'created_by', 'created_at', 'updated_at', 'description'],
  Categories: ['id', 'name', 'type', 'created_at', 'updated_at'],
  AuditLog: ['id', 'entity', 'entity_id', 'operation', 'changes', 'performed_by', 'timestamp'],
  System: ['key', 'value', 'updatedAt']
};

class DBService {
  constructor() {
    this.filePath = path.resolve(env.DB_FILE_PATH);
    this.tempFilePath = `${this.filePath}.tmp`;
    this.backupDir = path.join(path.dirname(this.filePath), 'backups');
    this.mutex = new Mutex();
  }

  async initialize() {
    return this.mutex.runExclusive(async () => {
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });

        let workbook = new ExcelJS.Workbook();
        if (fs.existsSync(this.filePath)) {
          await workbook.xlsx.readFile(this.filePath);
        }

        let needsSave = false;

        // Ensure all sheets and headers exist
        for (const [sheetName, columns] of Object.entries(SCHEMAS)) {
          let sheet = workbook.getWorksheet(sheetName);
          if (!sheet) {
            sheet = workbook.addWorksheet(sheetName);
            sheet.columns = columns.map(c => ({ header: c, key: c, width: 20 }));
            needsSave = true;
          } else {
            // Check if headers are missing and append them safely
            const firstRow = sheet.getRow(1);
            if (!firstRow.values || firstRow.values.length <= 1) {
              sheet.columns = columns.map(c => ({ header: c, key: c, width: 20 }));
              needsSave = true;
            } else {
              columns.forEach((colName, index) => {
                const cell = firstRow.getCell(index + 1);
                if (!cell.value) {
                  cell.value = colName;
                  needsSave = true;
                }
              });
              if (needsSave) firstRow.commit();
            }
          }
        }

        if (needsSave) {
          // If the file didn't exist, we just write it directly the first time
          await workbook.xlsx.writeFile(this.filePath);
          logger.info('Database initialized with required schemas.');
        } else {
          logger.info('Database validated.');
        }
      } catch (error) {
        logger.error('Failed to initialize database: ' + error.message);
        throw error;
      }
    });
  }

  async _createBackup() {
    if (!fs.existsSync(this.filePath)) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `database-${timestamp}.xlsx`);
    
    // Copy current file to backup
    await fs.promises.copyFile(this.filePath, backupPath);

    // Enforce retention policy
    const files = await fs.promises.readdir(this.backupDir);
    const backups = files
      .filter(f => f.startsWith('database-') && f.endsWith('.xlsx'))
      .map(f => ({ name: f, path: path.join(this.backupDir, f), time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time); // newest first

    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      for (const file of toDelete) {
        await fs.promises.unlink(file.path);
      }
    }
  }

  // Load a fresh copy of the workbook (must be inside mutex if modifying)
  async load() {
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(this.filePath)) {
      await workbook.xlsx.readFile(this.filePath);
    }
    return workbook;
  }

  // Atomically save a workbook
  async _saveAtomic(workbook) {
    try {
      await this._createBackup();
      
      // Write to temp file
      await workbook.xlsx.writeFile(this.tempFilePath);
      
      // Atomic rename
      await fs.promises.rename(this.tempFilePath, this.filePath);
    } catch (error) {
      // Clean up temp file on failure
      if (fs.existsSync(this.tempFilePath)) {
        await fs.promises.unlink(this.tempFilePath).catch(e => logger.error(`Failed to delete temp file: ${e.message}`));
      }
      throw error;
    }
  }

  /**
   * Executes a callback within a transactional lock.
   * The callback receives a `workbook` object to read/modify.
   * If the callback throws, modifications are discarded.
   * If it succeeds, the workbook is atomically saved.
   */
  async transaction(callback) {
    return this.mutex.runExclusive(async () => {
      const workbook = await this.load();
      try {
        const result = await callback(workbook);
        await this._saveAtomic(workbook);
        return result;
      } catch (error) {
        logger.error(`Transaction failed: ${error.message}`);
        throw error;
      }
    });
  }

  /**
   * Executes a read-only callback within a lock to ensure strong consistency.
   */
  async read(callback) {
    return this.mutex.runExclusive(async () => {
      const workbook = await this.load();
      return await callback(workbook);
    });
  }

  async checkHealth() {
    return this.mutex.runExclusive(async () => {
      try {
        if (!fs.existsSync(this.filePath)) {
          return { status: 'unhealthy', reason: 'File does not exist' };
        }
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(this.filePath);
        const sheet = workbook.getWorksheet('System');
        
        if (!sheet) {
          return { status: 'unhealthy', reason: 'System sheet not found' };
        }
        return { status: 'healthy', file: this.filePath };
      } catch (error) {
        return { status: 'unhealthy', reason: error.message };
      }
    });
  }
}

module.exports = new DBService();
