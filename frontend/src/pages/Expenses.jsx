import { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
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
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses();
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

  const downloadCSV = () => {
    if (!expenses || expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Amount', 'UPI Transaction', 'Created By', 'Updated By'];
    const csvRows = [headers.join(',')];

    for (const exp of expenses) {
      const row = [
        new Date(exp.date).toLocaleDateString(),
        `"${(exp.description || '').replace(/"/g, '""')}"`,
        `"${exp.category}"`,
        exp.amount,
        exp.upi_transaction === 'YES' || exp.upi_transaction === true ? 'YES' : 'NO',
        `"${exp.created_by || ''}"`,
        `"${exp.updated_by || ''}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your daily expenses.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-2 bg-card text-foreground rounded text-sm font-medium hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/80 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
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
