const { InvestmentRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getInvestments = async (req, res) => {
  try {
    const investments = await InvestmentRepository.find({});
    // sort by purchase_date desc
    investments.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
    res.json(investments);
  } catch (error) {
    logger.error(`Error getting investments: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

exports.createInvestment = async (req, res) => {
  try {
    const { asset_name, type, amount, current_value, purchase_date, description } = req.body;
    
    if (!asset_name || asset_name.trim() === '') return res.status(400).json({ error: 'Investment name is required' });
    if (!type || type.trim() === '') return res.status(400).json({ error: 'Investment type is required' });
    if (amount === undefined || isNaN(Number(amount))) return res.status(400).json({ error: 'Valid invested amount is required' });
    if (current_value === undefined || isNaN(Number(current_value))) return res.status(400).json({ error: 'Valid current value is required' });
    if (!purchase_date) return res.status(400).json({ error: 'Investment date is required' });

    const newInv = await InvestmentRepository.insert({
      asset_name: asset_name.trim(),
      type: type.trim(),
      amount: Number(amount),
      current_value: Number(current_value),
      purchase_date: new Date(purchase_date).toISOString(),
      description: description ? description.trim() : ''
    }, req.user.username);
    
    res.status(201).json(newInv);
  } catch (error) {
    logger.error(`Error creating investment: ${error.message}`);
    res.status(500).json({ error: 'Failed to create investment' });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { asset_name, type, amount, current_value, purchase_date, description } = req.body;

    const existing = await InvestmentRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Investment not found' });

    const updateData = {};
    if (asset_name !== undefined) updateData.asset_name = asset_name.trim();
    if (type !== undefined) updateData.type = type.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (current_value !== undefined) updateData.current_value = Number(current_value);
    if (purchase_date !== undefined) updateData.purchase_date = new Date(purchase_date).toISOString();
    if (description !== undefined) updateData.description = description.trim();

    const updated = await InvestmentRepository.update(id, updateData, req.user.username);
    res.json(updated);
  } catch (error) {
    logger.error(`Error updating investment: ${error.message}`);
    res.status(500).json({ error: 'Failed to update investment' });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await InvestmentRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Investment not found' });
    
    await InvestmentRepository.delete(id, req.user.username);
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting investment: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
};
