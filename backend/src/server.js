const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const logger = require('./utils/logger');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/investments', investmentRoutes);

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    const dbService = require('./services/dbService');
    await dbService.initialize();
    
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server: ' + error.message);
    process.exit(1);
  }
};

startServer();
