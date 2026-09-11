const { mongoose } = require('../config/db');
const migrate = require('../scripts/migrateFromExcel');
const logger = require('../utils/logger');

const getHealth = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Backend is running securely.',
        database: 'Connected to MongoDB',
        host: mongoose.connection.host,
        dbName: mongoose.connection.name
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Backend is running but MongoDB is not connected.',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    next(error);
  }
};

const repairDb = async (req, res, next) => {
  try {
    logger.info('Repair/Re-sync DB requested: running migration from Excel backup');
    const stats = await migrate();
    res.status(200).json({
      success: true,
      message: 'Database re-synchronized with Excel data',
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  repairDb
};
