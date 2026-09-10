import { useState, useEffect } from 'react';
import { getCategories } from '../../lib/expenseService';
import { X, Save } from 'lucide-react';

function ExpenseForm({ expense, onSave, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    upi_transaction: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    if (expense) {
      setFormData({
        amount: expense.amount || '',
        description: expense.description || '',
        category: expense.category || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        upi_transaction: expense.upi_transaction === 'YES' || expense.upi_transaction === true,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: Number(formData.amount)
      });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while saving the expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-bold text-foreground">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-7 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="upi_transaction"
              name="upi_transaction"
              checked={formData.upi_transaction}
              onChange={handleChange}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="upi_transaction" className="text-sm font-medium text-foreground cursor-pointer">
              Mark as UPI Transaction
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
