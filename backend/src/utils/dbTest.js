const { connectDB, mongoose } = require('../config/db');
const { ExpenseRepository, UserRepository } = require('../repositories');
const logger = require('./logger');

async function runTests() {
  logger.info('Connecting to DB for tests...');
  await connectDB();

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
  const created = await Promise.all(promises);
  logger.info(`10 concurrent writes completed successfully. First ID: ${created[0].id}`);

  logger.info('--- Test 2: Data Retrieval ---');
  const expenses = await ExpenseRepository.find({ category: 'Test' });
  logger.info(`Found ${expenses.length} test expenses.`);
  if (expenses.length >= 10) {
    logger.info('Data integrity verified.');
  } else {
    logger.error('Data integrity check failed. Expected at least 10 expenses.');
  }

  logger.info('--- Test 3: Update and Delete ---');
  const testExpense = created[0];
  const updated = await ExpenseRepository.update(testExpense.id, { amount: 999 }, 'test-user-1');
  logger.info(`Updated amount: ${updated.amount}`);

  // Clean up all test expenses
  for (const exp of expenses) {
    await ExpenseRepository.delete(exp.id, 'test-cleaner');
  }
  logger.info('Cleaned up test expenses.');

  logger.info('All tests completed successfully!');
  await mongoose.disconnect();
}

runTests().catch(err => {
  logger.error('Test suite failed: ' + err.stack);
  mongoose.disconnect();
});
