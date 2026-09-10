const { SavingsGoalRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoalRepository.find({});
    // sort by deadline
    goals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    res.json(goals);
  } catch (error) {
    logger.error(`Error getting goals: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, target_amount, deadline } = req.body;
    
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Name is required' });
    if (target_amount === undefined || isNaN(Number(target_amount))) return res.status(400).json({ error: 'Valid target amount is required' });
    if (!deadline) return res.status(400).json({ error: 'Deadline is required' });

    const newGoal = await SavingsGoalRepository.insert({
      name: name.trim(),
      target_amount: Number(target_amount),
      current_amount: 0, // Not strictly used if we rely on overall savings
      deadline: new Date(deadline).toISOString()
    }, req.user.username);
    
    res.status(201).json(newGoal);
  } catch (error) {
    logger.error(`Error creating goal: ${error.message}`);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target_amount, deadline } = req.body;

    const existing = await SavingsGoalRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (target_amount !== undefined) updateData.target_amount = Number(target_amount);
    if (deadline !== undefined) updateData.deadline = new Date(deadline).toISOString();

    const updated = await SavingsGoalRepository.update(id, updateData, req.user.username);
    res.json(updated);
  } catch (error) {
    logger.error(`Error updating goal: ${error.message}`);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SavingsGoalRepository.findById(id);
    if (!existing) return res.status(404).json({ error: 'Goal not found' });
    
    await SavingsGoalRepository.delete(id, req.user.username);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting goal: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};
