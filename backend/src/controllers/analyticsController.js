const { IncomeRepository, ExpenseRepository } = require('../repositories');
const logger = require('../utils/logger');

exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-09"

    const allIncome = await IncomeRepository.find({});
    const allExpenses = await ExpenseRepository.find({});

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalUpiExpenses = 0;
    
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyUpiExpenses = 0;

    // Aggregate all-time
    allIncome.forEach(inc => totalIncome += Number(inc.amount || 0));
    allExpenses.forEach(exp => {
      const amt = Number(exp.amount || 0);
      totalExpenses += amt;
      if (exp.upi_transaction === 'YES' || exp.upi_transaction === true || exp.upi_transaction === 'true') {
        totalUpiExpenses += amt;
      }
    });

    // Aggregate monthly if month is provided
    if (month) {
      allIncome.forEach(inc => {
        if (inc.date && inc.date.startsWith(month)) {
          monthlyIncome += Number(inc.amount || 0);
        }
      });
      allExpenses.forEach(exp => {
        if (exp.date && exp.date.startsWith(month)) {
          const amt = Number(exp.amount || 0);
          monthlyExpenses += amt;
          if (exp.upi_transaction === 'YES' || exp.upi_transaction === true || exp.upi_transaction === 'true') {
            monthlyUpiExpenses += amt;
          }
        }
      });
    }

    res.json({
      totalIncome,
      totalExpenses,
      totalUpiExpenses,
      overallSavings: totalIncome - totalExpenses,
      monthlyIncome: month ? monthlyIncome : totalIncome,
      monthlyExpenses: month ? monthlyExpenses : totalExpenses,
      monthlyUpiExpenses: month ? monthlyUpiExpenses : totalUpiExpenses,
      monthlySavings: month ? (monthlyIncome - monthlyExpenses) : (totalIncome - totalExpenses),
    });
  } catch (error) {
    logger.error(`Error calculating analytics summary: ${error.message}`);
    res.status(500).json({ error: 'Failed to calculate summary' });
  }
};
