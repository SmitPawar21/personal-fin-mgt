const { CategoryRepository } = require('../repositories');
const logger = require('../utils/logger');

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Utilities',
  'Entertainment',
  'Health & Wellness',
  'Shopping',
  'Personal Care',
  'Education',
  'Miscellaneous'
];

exports.getCategories = async (req, res) => {
  try {
    let categories = await CategoryRepository.find({ type: 'EXPENSE' });
    
    // Seed default categories if none exist
    if (categories.length === 0) {
      const promises = DEFAULT_CATEGORIES.map(name => 
        CategoryRepository.insert({ name, type: 'EXPENSE' }, 'system')
      );
      categories = await Promise.all(promises);
    }
    
    // Also fetch generic ones that don't have a type or all categories, 
    // but right now let's just stick to EXPENSE types
    const allCategories = await CategoryRepository.find({});
    let expenseCategories = allCategories.filter(c => c.type === 'EXPENSE' || !c.type);

    if (expenseCategories.length === 0) {
        const promises = DEFAULT_CATEGORIES.map(name => 
          CategoryRepository.insert({ name, type: 'EXPENSE' }, 'system')
        );
        expenseCategories = await Promise.all(promises);
    }

    res.json(expenseCategories);
  } catch (error) {
    logger.error(`Error getting categories: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category already exists
    const existing = await CategoryRepository.find({ name: name.trim() });
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const newCat = await CategoryRepository.insert({ name: name.trim(), type: type || 'EXPENSE' }, req.user.username);
    res.status(201).json(newCat);
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await CategoryRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Referential Integrity Check: Expenses
    const { ExpenseRepository, BudgetRepository } = require('../repositories');
    const expenses = await ExpenseRepository.find({ category: existing.name });
    if (expenses.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category as it is currently used by expenses' });
    }

    // Referential Integrity Check: Budgets
    const budgets = await BudgetRepository.find({ category: existing.name });
    if (budgets.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category as it is currently assigned to a budget' });
    }

    await CategoryRepository.delete(id, req.user.username);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
