const path = require('path');
require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_FILE_PATH: process.env.DB_FILE_PATH || path.join(__dirname, '../../data/database.xlsx'),
};

module.exports = env;
