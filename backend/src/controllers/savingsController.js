const { SavingsRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getSavings = async (req, res) => {
  try {
    const savings = await SavingsRepository.find({});
    // sort by created date
    savings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(savings);
  } catch (error) {
    logger.error(`Error getting savings: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch savings cards' });
  }
};

exports.createSaving = async (req, res) => {
  try {
    const { source, amount, description } = req.body;
    
    if (!source || source.trim() === '') {
      return res.status(400).json({ error: 'Name/Type (source) is required' });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const newSaving = await SavingsRepository.insert({
      source: source.trim(),
      amount: Number(amount),
      description: description ? description.trim() : '',
      date: new Date().toISOString()
    }, req.user.username);
    
    res.status(201).json(newSaving);
  } catch (error) {
    logger.error(`Error creating saving card: ${error.message}`);
    res.status(500).json({ error: 'Failed to create saving card' });
  }
};

exports.updateSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, description } = req.body;

    const existing = await SavingsRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Saving card not found' });

    const updateData = {};
    if (source !== undefined) updateData.source = source.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (description !== undefined) updateData.description = description.trim();

    const updated = await SavingsRepository.update(id, updateData, req.user.username);
    res.json(updated);
  } catch (error) {
    logger.error(`Error updating saving card: ${error.message}`);
    res.status(500).json({ error: 'Failed to update saving card' });
  }
};

exports.deleteSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SavingsRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Saving card not found' });
    
    await SavingsRepository.delete(id, req.user.username);
    res.json({ message: 'Saving card deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting saving card: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete saving card' });
  }
};
