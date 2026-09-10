const { IncomeRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getIncome = async (req, res) => {
  try {
    const { month } = req.query;
    let incomes = await IncomeRepository.find({});
    
    if (month) {
      incomes = incomes.filter(inc => inc.date && inc.date.startsWith(month));
    }
    
    incomes.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(incomes);
  } catch (error) {
    logger.error(`Error getting income: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch income records' });
  }
};

exports.createIncome = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const newIncome = await IncomeRepository.insert({
      amount: Number(amount),
      description: description ? description.trim() : '',
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
    }, req.user.username);
    
    res.status(201).json(newIncome);
  } catch (error) {
    logger.error(`Error creating income: ${error.message}`);
    res.status(500).json({ error: 'Failed to create income record' });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await IncomeRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Income not found' });
    
    await IncomeRepository.delete(id, req.user.username);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting income: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete income' });
  }
};
