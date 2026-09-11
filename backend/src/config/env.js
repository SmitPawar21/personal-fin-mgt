const path = require('path');
require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal_finance',
  DB_FILE_PATH: process.env.DB_FILE_PATH || path.join(__dirname, '../../data/database.xlsx'),
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-for-development-only-change-in-prod',
  FAMILY_PASSWORD: process.env.FAMILY_PASSWORD || 'secretfamily',
};

module.exports = env;
