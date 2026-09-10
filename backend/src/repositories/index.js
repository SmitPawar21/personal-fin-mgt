const BaseRepository = require('./baseRepository');

class UserRepository extends BaseRepository {
  constructor() { super('Users'); }
}
class ExpenseRepository extends BaseRepository {
  constructor() { super('Expenses'); }
}
class SavingsRepository extends BaseRepository {
  constructor() { super('Savings'); }
}
class SavingsGoalRepository extends BaseRepository {
  constructor() { super('SavingsGoals'); }
}
class BudgetRepository extends BaseRepository {
  constructor() { super('Budgets'); }
}
class InvestmentRepository extends BaseRepository {
  constructor() { super('Investments'); }
}
class CategoryRepository extends BaseRepository {
  constructor() { super('Categories'); }
}
class AuditLogRepository extends BaseRepository {
  constructor() { super('AuditLog'); }
}

module.exports = {
  UserRepository: new UserRepository(),
  ExpenseRepository: new ExpenseRepository(),
  SavingsRepository: new SavingsRepository(),
  SavingsGoalRepository: new SavingsGoalRepository(),
  BudgetRepository: new BudgetRepository(),
  InvestmentRepository: new InvestmentRepository(),
  CategoryRepository: new CategoryRepository(),
  AuditLogRepository: new AuditLogRepository()
};
