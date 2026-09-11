const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { connectDB, mongoose } = require('../config/db');
const env = require('../config/env');
const logger = require('../utils/logger');
const models = require('../models');

// Helper to convert sheet rows into objects based on row 1 headers
function parseSheetRows(sheet) {
  if (!sheet) return [];
  const headers = [];
  const firstRow = sheet.getRow(1);
  firstRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value;
  });

  const records = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const record = {};
    headers.forEach((header, index) => {
      let val = row.getCell(index + 1).value;
      // Handle Excel formula or rich text objects
      if (val && typeof val === 'object') {
        val = val.result !== undefined ? val.result : (val.text !== undefined ? val.text : String(val));
      }
      record[header] = val;
    });
    // Ensure record has at least an id or identifier
    if (record.id || record.key || record.name || record.username) {
      records.push(record);
    }
  });
  return records;
}

async function migrate() {
  logger.info('Starting migration from Excel to MongoDB...');
  await connectDB();

  const excelPath = path.resolve(env.DB_FILE_PATH);
  if (!fs.existsSync(excelPath)) {
    logger.error(`Excel database file not found at: ${excelPath}`);
    return;
  }

  logger.info(`Reading Excel file: ${excelPath}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const stats = {};

  // 1. Users
  const userSheet = workbook.getWorksheet('Users');
  const userRecords = parseSheetRows(userSheet);
  stats.Users = 0;
  for (const u of userRecords) {
    if (!u.username) continue;
    await models.User.findOneAndUpdate(
      { $or: [{ id: u.id }, { username: u.username }] },
      {
        $set: {
          id: u.id,
          username: u.username,
          password_hash: u.password_hash,
          role: u.role || 'user',
          created_at: u.created_at || new Date().toISOString(),
          updated_at: u.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Users++;
  }

  // 2. Categories
  const catSheet = workbook.getWorksheet('Categories');
  const catRecords = parseSheetRows(catSheet);
  stats.Categories = 0;
  for (const c of catRecords) {
    if (!c.name) continue;
    await models.Category.findOneAndUpdate(
      { $or: [{ id: c.id }, { name: c.name }] },
      {
        $set: {
          id: c.id,
          name: c.name,
          type: c.type || 'EXPENSE',
          created_at: c.created_at || new Date().toISOString(),
          updated_at: c.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Categories++;
  }

  // 3. Expenses
  const expSheet = workbook.getWorksheet('Expenses');
  const expRecords = parseSheetRows(expSheet);
  stats.Expenses = 0;
  for (const e of expRecords) {
    if (!e.id && !e.amount) continue;
    await models.Expense.findOneAndUpdate(
      { id: e.id },
      {
        $set: {
          id: e.id,
          date: e.date || new Date().toISOString(),
          amount: Number(e.amount || 0),
          description: e.description || '',
          category: e.category || 'Miscellaneous',
          upi_transaction: (e.upi_transaction === 'YES' || e.upi_transaction === true) ? 'YES' : 'NO',
          created_by: e.created_by || 'system',
          updated_by: e.updated_by || 'system',
          created_at: e.created_at || new Date().toISOString(),
          updated_at: e.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Expenses++;
  }

  // 4. Income
  const incSheet = workbook.getWorksheet('Income');
  const incRecords = parseSheetRows(incSheet);
  stats.Income = 0;
  for (const inc of incRecords) {
    if (!inc.id && !inc.amount) continue;
    await models.Income.findOneAndUpdate(
      { id: inc.id },
      {
        $set: {
          id: inc.id,
          date: inc.date || new Date().toISOString(),
          amount: Number(inc.amount || 0),
          description: inc.description || '',
          created_by: inc.created_by || 'system',
          updated_by: inc.updated_by || 'system',
          created_at: inc.created_at || new Date().toISOString(),
          updated_at: inc.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Income++;
  }

  // 5. Savings
  const savSheet = workbook.getWorksheet('Savings');
  const savRecords = parseSheetRows(savSheet);
  stats.Savings = 0;
  for (const s of savRecords) {
    if (!s.id && !s.source) continue;
    await models.Savings.findOneAndUpdate(
      { id: s.id },
      {
        $set: {
          id: s.id,
          date: s.date || new Date().toISOString(),
          amount: Number(s.amount || 0),
          source: s.source || '',
          description: s.description || '',
          created_by: s.created_by || 'system',
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Savings++;
  }

  // 6. SavingsGoals
  const goalSheet = workbook.getWorksheet('SavingsGoals');
  const goalRecords = parseSheetRows(goalSheet);
  stats.SavingsGoals = 0;
  for (const g of goalRecords) {
    if (!g.id && !g.name) continue;
    await models.SavingsGoal.findOneAndUpdate(
      { id: g.id },
      {
        $set: {
          id: g.id,
          name: g.name || '',
          target_amount: Number(g.target_amount || 0),
          current_amount: Number(g.current_amount || 0),
          deadline: g.deadline || new Date().toISOString(),
          created_by: g.created_by || 'system',
          created_at: g.created_at || new Date().toISOString(),
          updated_at: g.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.SavingsGoals++;
  }

  // 7. Budgets
  const budSheet = workbook.getWorksheet('Budgets');
  const budRecords = parseSheetRows(budSheet);
  stats.Budgets = 0;
  for (const b of budRecords) {
    if (!b.id && !b.category) continue;
    await models.Budget.findOneAndUpdate(
      { id: b.id },
      {
        $set: {
          id: b.id,
          category: b.category || '',
          month: String(b.month || ''),
          year: String(b.year || ''),
          amount: Number(b.amount || 0),
          created_by: b.created_by || 'system',
          created_at: b.created_at || new Date().toISOString(),
          updated_at: b.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Budgets++;
  }

  // 8. Investments
  const invSheet = workbook.getWorksheet('Investments');
  const invRecords = parseSheetRows(invSheet);
  stats.Investments = 0;
  for (const inv of invRecords) {
    if (!inv.id && !inv.asset_name) continue;
    await models.Investment.findOneAndUpdate(
      { id: inv.id },
      {
        $set: {
          id: inv.id,
          type: inv.type || '',
          asset_name: inv.asset_name || '',
          amount: Number(inv.amount || 0),
          purchase_date: inv.purchase_date || new Date().toISOString(),
          current_value: Number(inv.current_value || 0),
          description: inv.description || '',
          created_by: inv.created_by || 'system',
          created_at: inv.created_at || new Date().toISOString(),
          updated_at: inv.updated_at || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.Investments++;
  }

  // 9. AuditLog
  const auditSheet = workbook.getWorksheet('AuditLog');
  const auditRecords = parseSheetRows(auditSheet);
  stats.AuditLog = 0;
  for (const a of auditRecords) {
    if (!a.id) continue;
    await models.AuditLog.findOneAndUpdate(
      { id: a.id },
      {
        $set: {
          id: a.id,
          entity: a.entity || 'Unknown',
          entity_id: String(a.entity_id || ''),
          operation: a.operation || 'UNKNOWN',
          changes: a.changes || '',
          performed_by: a.performed_by || 'system',
          timestamp: a.timestamp || new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    stats.AuditLog++;
  }

  // 10. System
  const sysSheet = workbook.getWorksheet('System');
  const sysRecords = parseSheetRows(sysSheet);
  stats.System = 0;
  for (const s of sysRecords) {
    if (!s.key && !s.Key) continue;
    const key = s.key || s.Key;
    const value = s.value || s.Value || '';
    const updatedAt = s.updatedAt || s.UpdatedAt || new Date().toISOString();
    await models.System.findOneAndUpdate(
      { key },
      { $set: { key, value, updatedAt } },
      { upsert: true, returnDocument: 'after' }
    );
    stats.System++;
  }

  logger.info('==========================================');
  logger.info('MIGRATION COMPLETED SUCCESSFULLY!');
  logger.info(JSON.stringify(stats, null, 2));
  logger.info('==========================================');

  return stats;
}

if (require.main === module) {
  migrate()
    .then(() => {
      logger.info('Migration finished, closing database connection.');
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Migration failed: ' + err.message);
      mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = migrate;
