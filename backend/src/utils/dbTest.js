const dbService = require('../services/dbService');
const { ExpenseRepository, UserRepository } = require('../repositories');
const logger = require('./logger');

async function runTests() {
  logger.info('Initializing DB for tests...');
  await dbService.initialize();

  logger.info('--- Test 1: Concurrent Writes ---');
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      ExpenseRepository.insert({
        date: new Date().toISOString(),
        amount: Math.floor(Math.random() * 100) + 1,
        description: `Concurrent expense ${i}`,
        category: 'Test',
        upi_transaction: false
      }, 'test-user-1')
    );
  }

  logger.info('Waiting for 10 concurrent writes to finish...');
  await Promise.all(promises);
  logger.info('10 concurrent writes completed successfully.');

  logger.info('--- Test 2: Validation / Rollback ---');
  try {
    await ExpenseRepository.transaction(async (workbook) => {
      logger.info('Inside transaction: making an uncommitted change...');
      const sheet = workbook.getWorksheet('Users');
      sheet.addRow({ id: 'temp-123', username: 'temp_user' });
      
      logger.info('Intentionally throwing an error to trigger rollback...');
      throw new Error('Intentional failure');
    });
  } catch (err) {
    logger.info(`Caught expected error: ${err.message}`);
  }

  logger.info('Verifying rollback...');
  const users = await UserRepository.find({ id: 'temp-123' });
  if (users.length === 0) {
    logger.info('Rollback successful. "temp_user" does not exist in DB.');
  } else {
    logger.error('Rollback FAILED. "temp_user" found in DB.');
  }

  logger.info('--- Test 3: Data Integrity ---');
  const expenses = await ExpenseRepository.find({ category: 'Test' });
  logger.info(`Found ${expenses.length} test expenses.`);
  if (expenses.length >= 10) {
    logger.info('Data integrity verified.');
  } else {
    logger.error('Data integrity check failed. Expected at least 10 expenses.');
  }

  logger.info('All tests completed.');
}

runTests().catch(err => logger.error('Test suite failed: ' + err.stack));
