const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const logger = require('../utils/logger');

class DBService {
  constructor() {
    this.filePath = path.resolve(env.DB_FILE_PATH);
    this.workbook = new ExcelJS.Workbook();
  }

  async initialize() {
    try {
      if (fs.existsSync(this.filePath)) {
        logger.info(`Database found at ${this.filePath}`);
      } else {
        logger.info(`Database not found. Creating new Excel file at ${this.filePath}`);
        // Ensure directory exists
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Create an initial System sheet
        const sheet = this.workbook.addWorksheet('System');
        sheet.columns = [
          { header: 'Key', key: 'key', width: 20 },
          { header: 'Value', key: 'value', width: 30 },
          { header: 'UpdatedAt', key: 'updatedAt', width: 25 },
        ];
        
        sheet.addRow({
          key: 'initialized',
          value: 'true',
          updatedAt: new Date().toISOString()
        });

        await this.workbook.xlsx.writeFile(this.filePath);
        logger.info('Excel database initialized successfully.');
      }
    } catch (error) {
      logger.error('Failed to initialize database: ' + error.message);
      throw error;
    }
  }

  async checkHealth() {
    try {
      await this.workbook.xlsx.readFile(this.filePath);
      const sheet = this.workbook.getWorksheet('System');
      
      if (!sheet) {
        return { status: 'unhealthy', reason: 'System sheet not found' };
      }

      return { status: 'healthy', file: this.filePath };
    } catch (error) {
      logger.error('Health check failed: ' + error.message);
      return { status: 'unhealthy', reason: error.message };
    }
  }
}

// Export a singleton instance
module.exports = new DBService();
