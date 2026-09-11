const express = require('express');
const cors = require('cors');
const path = require('path');
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

// --- Serve Frontend in Production ---
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all: send index.html for any non-API route (SPA client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const startServer = async () => {
  try {
    const { connectDB } = require('./config/db');
    const { Category } = require('./models');
    const migrate = require('./scripts/migrateFromExcel');

    await connectDB();
    
    // Auto-sync from Excel if database has no categories yet
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      logger.info('Database is empty on start. Running initial migration from Excel...');
      await migrate();
    }
    
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server: ' + error.message);
    process.exit(1);
  }
};

startServer();
