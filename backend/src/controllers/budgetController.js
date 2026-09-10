const { BudgetRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = month;
    if (year) query.year = String(year);

    const budgets = await BudgetRepository.find(query);
    res.json(budgets);
  } catch (error) {
    logger.error(`Error getting budgets: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { category, month, year, amount } = req.body;
    
    if (!category || !month || !year || amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Category, month, year, and amount are required' });
    }

    // Check if budget exists for this category, month and year
    const existingBudgets = await BudgetRepository.find({ category, month, year: String(year) });
    
    let budget;
    if (existingBudgets.length > 0) {
      budget = await BudgetRepository.update(existingBudgets[0].id, { amount: Number(amount) }, req.user.username);
    } else {
      budget = await BudgetRepository.insert({
        category,
        month,
        year: String(year),
        amount: Number(amount)
      }, req.user.username);
    }

    res.status(200).json(budget);
  } catch (error) {
    logger.error(`Error saving budget: ${error.message}`);
    res.status(500).json({ error: 'Failed to save budget' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await BudgetRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Budget not found' });
    
    await BudgetRepository.delete(id, req.user.username);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting budget: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
