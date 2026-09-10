const dbService = require('../services/dbService');
const crypto = require('crypto');

class BaseRepository {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }

  // Helper to map row to object based on headers
  _rowToObject(row, headers) {
    const obj = {};
    headers.forEach((header, index) => {
      // row.values is 1-indexed, but if we use getCell it's better
      // row.values[1] is the first column, etc.
      // A safer way is to use the actual column keys if defined, but row.getCell(i) is easiest.
      obj[header] = row.getCell(index + 1).value;
    });
    return obj;
  }

  // Extract headers from the first row
  _getHeaders(sheet) {
    const row = sheet.getRow(1);
    const headers = [];
    row.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value;
    });
    return headers;
  }

  async find(query = {}) {
    return dbService.read(async (workbook) => {
      const sheet = workbook.getWorksheet(this.sheetName);
      if (!sheet) return [];

      const headers = this._getHeaders(sheet);
      const results = [];

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const obj = this._rowToObject(row, headers);
        
        // basic match
        let isMatch = true;
        for (const [key, val] of Object.entries(query)) {
          if (obj[key] !== val) {
            isMatch = false;
            break;
          }
        }
        if (isMatch && obj.id) {
          results.push(obj);
        }
      });

      return results;
    });
  }

  async findById(id) {
    const results = await this.find({ id });
    return results.length > 0 ? results[0] : null;
  }

  // Internal audit log append function, meant to be run inside a transaction
  _logAudit(workbook, operation, entityId, changes, userId) {
    const auditSheet = workbook.getWorksheet('AuditLog');
    if (auditSheet) {
      auditSheet.addRow({
        id: crypto.randomUUID(),
        entity: this.sheetName,
        entity_id: entityId,
        operation,
        changes: JSON.stringify(changes),
        performed_by: userId || 'system',
        timestamp: new Date().toISOString()
      });
    }
  }

  async insert(data, userId) {
    return dbService.transaction(async (workbook) => {
      const sheet = workbook.getWorksheet(this.sheetName);
      if (!sheet) throw new Error(`Sheet ${this.sheetName} not found`);

      const id = data.id || crypto.randomUUID();
      const now = new Date().toISOString();
      
      const newRecord = {
        ...data,
        id,
        created_at: now,
        updated_at: now,
        created_by: userId,
        updated_by: userId
      };

      const headers = this._getHeaders(sheet);
      const rowValues = [];
      headers.forEach(h => {
        rowValues.push(newRecord[h]);
      });
      
      // Add row using array to ensure correct mapping without relying on column keys
      sheet.addRow(rowValues);
      
      // Audit
      this._logAudit(workbook, 'CREATE', id, newRecord, userId);

      return newRecord;
    });
  }

  async update(id, data, userId) {
    return dbService.transaction(async (workbook) => {
      const sheet = workbook.getWorksheet(this.sheetName);
      if (!sheet) throw new Error(`Sheet ${this.sheetName} not found`);

      const headers = this._getHeaders(sheet);
      let targetRow = null;
      let existingData = null;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = this._rowToObject(row, headers);
        if (obj.id === id) {
          targetRow = row;
          existingData = obj;
        }
      });

      if (!targetRow) throw new Error(`${this.sheetName} with id ${id} not found`);

      const now = new Date().toISOString();
      const updatedData = {
        ...existingData,
        ...data,
        id, // never change id
        updated_at: now,
        updated_by: userId
      };

      // Update cells
      headers.forEach((header, index) => {
        if (updatedData[header] !== undefined) {
          targetRow.getCell(index + 1).value = updatedData[header];
        }
      });

      // Audit
      this._logAudit(workbook, 'UPDATE', id, updatedData, userId);

      return updatedData;
    });
  }

  async delete(id, userId) {
    return dbService.transaction(async (workbook) => {
      const sheet = workbook.getWorksheet(this.sheetName);
      if (!sheet) throw new Error(`Sheet ${this.sheetName} not found`);

      const headers = this._getHeaders(sheet);
      let targetRowNumber = null;
      let existingData = null;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = this._rowToObject(row, headers);
        if (obj.id === id) {
          targetRowNumber = rowNumber;
          existingData = obj;
        }
      });

      if (!targetRowNumber) throw new Error(`${this.sheetName} with id ${id} not found`);

      // ExcelJS spliceRows is the way to delete a row
      sheet.spliceRows(targetRowNumber, 1);

      // Audit
      this._logAudit(workbook, 'DELETE', id, existingData, userId);

      return true;
    });
  }

  // Allows running multiple operations in a single atomic transaction
  async transaction(operationsFn) {
    return dbService.transaction(operationsFn);
  }
}

module.exports = BaseRepository;
