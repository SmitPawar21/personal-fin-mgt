const { IncomeRepository, ExpenseRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-09"

    const allIncome = await IncomeRepository.find({});
    const allExpenses = await ExpenseRepository.find({});

    let totalIncome = 0;
    let totalExpenses = 0;
    
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    // Aggregate all-time
    allIncome.forEach(inc => totalIncome += Number(inc.amount || 0));
    allExpenses.forEach(exp => totalExpenses += Number(exp.amount || 0));

    // Aggregate monthly if month is provided
    if (month) {
      allIncome.forEach(inc => {
        if (inc.date && inc.date.startsWith(month)) {
          monthlyIncome += Number(inc.amount || 0);
        }
      });
      allExpenses.forEach(exp => {
        if (exp.date && exp.date.startsWith(month)) {
          monthlyExpenses += Number(exp.amount || 0);
        }
      });
    }

    res.json({
      totalIncome,
      totalExpenses,
      overallSavings: totalIncome - totalExpenses,
      monthlyIncome: month ? monthlyIncome : totalIncome,
      monthlyExpenses: month ? monthlyExpenses : totalExpenses,
      monthlySavings: month ? (monthlyIncome - monthlyExpenses) : (totalIncome - totalExpenses),
    });
  } catch (error) {
    logger.error(`Error calculating analytics summary: ${error.message}`);
    res.status(500).json({ error: 'Failed to calculate summary' });
  }
};
