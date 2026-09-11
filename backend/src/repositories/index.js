const BaseRepository = require('./baseRepository');
const {
  User,
  Expense,
  Income,
  Savings,
  SavingsGoal,
  Budget,
  Investment,
  Category,
  AuditLog,
  System
} = require('../models');

class UserRepository extends BaseRepository {
  constructor() { super(User, 'User'); }
}
class ExpenseRepository extends BaseRepository {
  constructor() { super(Expense, 'Expense'); }
}
class IncomeRepository extends BaseRepository {
  constructor() { super(Income, 'Income'); }
}
class SavingsRepository extends BaseRepository {
  constructor() { super(Savings, 'Savings'); }
}
class SavingsGoalRepository extends BaseRepository {
  constructor() { super(SavingsGoal, 'SavingsGoal'); }
}
class BudgetRepository extends BaseRepository {
  constructor() { super(Budget, 'Budget'); }
}
class InvestmentRepository extends BaseRepository {
  constructor() { super(Investment, 'Investment'); }
}
class CategoryRepository extends BaseRepository {
  constructor() { super(Category, 'Category'); }
}
class AuditLogRepository extends BaseRepository {
  constructor() { super(AuditLog, 'AuditLog'); }
}
class SystemRepository extends BaseRepository {
  constructor() { super(System, 'System'); }
}

module.exports = {
  UserRepository: new UserRepository(),
  ExpenseRepository: new ExpenseRepository(),
  IncomeRepository: new IncomeRepository(),
  SavingsRepository: new SavingsRepository(),
  SavingsGoalRepository: new SavingsGoalRepository(),
  BudgetRepository: new BudgetRepository(),
  InvestmentRepository: new InvestmentRepository(),
  CategoryRepository: new CategoryRepository(),
  AuditLogRepository: new AuditLogRepository(),
  SystemRepository: new SystemRepository(),
};
