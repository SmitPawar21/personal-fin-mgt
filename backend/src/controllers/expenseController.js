const { ExpenseRepository } = require('../repositories');
const logger = require('../utils/logger');

// Get all expenses with optional filters
exports.getExpenses = async (req, res) => {
  try {
    const { month, category, upi_transaction, search } = req.query;

    // We fetch all and then apply advanced filters in memory
    // because BaseRepository find() only supports exact match.
    let expenses = await ExpenseRepository.find({});

    if (month) {
      // month format: YYYY-MM
      expenses = expenses.filter(exp => exp.date && exp.date.startsWith(month));
    }
    
    if (category) {
      expenses = expenses.filter(exp => exp.category === category);
    }
    
    if (upi_transaction !== undefined) {
      // Handle boolean conversion from string query param
      const isUpi = upi_transaction === 'true' || upi_transaction === 'YES';
      expenses = expenses.filter(exp => {
        const expUpi = exp.upi_transaction === true || exp.upi_transaction === 'true' || exp.upi_transaction === 'YES';
        return expUpi === isUpi;
      });
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      expenses = expenses.filter(exp => 
        (exp.description && exp.description.toLowerCase().includes(lowerSearch)) ||
        (exp.category && exp.category.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(expenses);
  } catch (error) {
    logger.error(`Error getting expenses: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Add a new expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, category, date, upi_transaction } = req.body;
    
    // Validation
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Amount is required and must be a number' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ error: 'Category is required' });
    }

    const expenseData = {
      amount: Number(amount),
      description: description ? description.trim() : '',
      category: category.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      upi_transaction: upi_transaction === true || upi_transaction === 'YES' || upi_transaction === 'true' ? 'YES' : 'NO'
    };

    const newExpense = await ExpenseRepository.insert(expenseData, req.user.username);
    res.status(201).json(newExpense);
  } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// Update an existing expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, date, upi_transaction } = req.body;
    
    const existing = await ExpenseRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updateData = {};
    if (amount !== undefined) {
      if (isNaN(Number(amount))) return res.status(400).json({ error: 'Amount must be a number' });
      updateData.amount = Number(amount);
    }
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) {
      if (category.trim() === '') return res.status(400).json({ error: 'Category cannot be empty' });
      updateData.category = category.trim();
    }
    if (date !== undefined) updateData.date = new Date(date).toISOString();
    if (upi_transaction !== undefined) {
      updateData.upi_transaction = (upi_transaction === true || upi_transaction === 'YES' || upi_transaction === 'true') ? 'YES' : 'NO';
    }

    const updatedExpense = await ExpenseRepository.update(id, updateData, req.user.username);
    res.json(updatedExpense);
  } catch (error) {
    logger.error(`Error updating expense: ${error.message}`);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await ExpenseRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await ExpenseRepository.delete(id, req.user.username);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting expense: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
