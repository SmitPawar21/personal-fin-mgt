import { useState, useEffect } from 'react';
import { getBudgets, saveBudget, deleteBudget } from '../lib/apiService';
import { getExpenses, getCategories } from '../lib/expenseService';
import { Plus, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Overall', amount: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [budData, expData, catData] = await Promise.all([
          getBudgets({ month: selectedMonth }),
          getExpenses({ month: selectedMonth }),
          getCategories()
        ]);
        setBudgets(budData);
        setExpenses(expData);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to fetch budget data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const refreshData = async () => {
    const [budData, expData, catData] = await Promise.all([
      getBudgets({ month: selectedMonth }),
      getExpenses({ month: selectedMonth }),
      getCategories()
    ]);
    setBudgets(budData);
    setExpenses(expData);
    setCategories(catData);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveBudget({
        category: form.category,
        month: selectedMonth,
        year: selectedMonth.split('-')[0],
        amount: form.amount
      });
      setShowForm(false);
      setForm({ category: 'Overall', amount: '' });
      refreshData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget?')) {
      await deleteBudget(id);
      refreshData();
    }
  };

  // Calculate actuals
  const calculateProgress = (budget) => {
    let actual = 0;
    if (budget.category === 'Overall') {
      actual = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    } else {
      actual = expenses
        .filter(exp => exp.category === budget.category)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);
    }
    const target = Number(budget.amount);
    const percent = target > 0 ? (actual / target) * 100 : 0;
    const remaining = target - actual;
    
    return { actual, target, percent: Math.min(percent, 100), over: percent > 100, remaining };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage your overall and category-wise budgets.</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded border border-input bg-background px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Budget
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-lg border border-border shadow-sm flex items-end gap-4 animate-in slide-in-from-top-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select 
              required
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Overall">Overall Monthly Budget</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input 
              type="number" required min="1" step="0.01" placeholder="Budget limit"
              value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded">Save</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 animate-pulse text-muted-foreground">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-card rounded border border-border">
          <p className="text-muted-foreground">No budgets set for {selectedMonth}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.sort((a,b) => a.category === 'Overall' ? -1 : 1).map(budget => {
            const { actual, target, percent, over, remaining } = calculateProgress(budget);
            return (
              <div key={budget.id} className={`bg-card p-5 rounded-lg border shadow-sm ${over ? 'border-red-500/50 bg-red-50/10' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {budget.category === 'Overall' ? 'Overall Budget' : budget.category}
                      {over && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {over ? (
                        <span className="text-red-500 font-medium">Over budget by ₹{Math.abs(remaining).toFixed(2)}</span>
                      ) : (
                        <span>₹{remaining.toFixed(2)} remaining</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-lg font-mono">
                      <span className={over ? 'text-red-600 font-bold' : 'text-foreground'}>₹{actual.toFixed(2)}</span>
                      <span className="text-muted-foreground text-sm"> / ₹{target.toFixed(2)}</span>
                    </p>
                    <button onClick={() => handleDelete(budget.id)} className="text-muted-foreground hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${over ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>{percent.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Budgets;
