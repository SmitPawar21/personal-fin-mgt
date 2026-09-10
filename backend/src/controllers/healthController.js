const dbService = require('../services/dbService');
const logger = require('../utils/logger');

const getHealth = async (req, res, next) => {
  try {
    const dbHealth = await dbService.checkHealth();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        success: true,
        message: 'Backend is running securely.',
        database: 'Connected to Excel DB'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Backend is running but DB check failed.',
        error: dbHealth.reason
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth
};
