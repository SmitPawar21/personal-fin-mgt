import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../lib/expenseService';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    month: '',
    category: '',
    upi_transaction: ''
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Build clean params
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.month) params.month = filters.month;
      if (filters.category) params.category = filters.category;
      if (filters.upi_transaction) params.upi_transaction = filters.upi_transaction;

      const data = await getExpenses(params);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSave = async (expenseData) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
    } else {
      await createExpense(expenseData);
    }
    setIsFormOpen(false);
    setEditingExpense(null);
    fetchExpenses(); // Refresh list
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses(); // Refresh list
      } catch (error) {
        console.error('Failed to delete expense', error);
        alert('Failed to delete expense.');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage and track your daily expenses.</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <ExpenseFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="text-muted-foreground animate-pulse">Loading expenses...</span>
        </div>
      ) : (
        <ExpenseList 
          expenses={expenses} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {isFormOpen && (
        <ExpenseForm 
          expense={editingExpense} 
          onSave={handleSave} 
          onCancel={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }} 
        />
      )}
    </div>
  );
}

export default Expenses;
