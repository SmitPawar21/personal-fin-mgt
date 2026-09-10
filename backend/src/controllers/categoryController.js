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
    // Actually, maybe some old categories exist without type, so let's fetch all and filter by type or no type
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
