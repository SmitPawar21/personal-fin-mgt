import { useState, useEffect } from 'react';
import { getAnalyticsSummary, getIncome, createIncome, deleteIncome, getSavings, createSaving, updateSaving, deleteSaving } from '../lib/apiService';
import { Plus, Trash2, Pencil, Wallet } from 'lucide-react';

function Savings() {
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [savingsCards, setSavingsCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const [showSavingForm, setShowSavingForm] = useState(false);
  const [savingForm, setSavingForm] = useState({ id: null, source: '', amount: '', description: '' });

  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, incData, savData] = await Promise.all([
        getAnalyticsSummary({ month: currentMonth }),
        getIncome({ month: currentMonth }),
        getSavings()
      ]);
      setSummary(sumData);
      setIncomes(incData);
      setSavingsCards(savData);
    } catch (err) {
      console.error('Failed to fetch savings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIncome(incomeForm);
      setShowIncomeForm(false);
      setIncomeForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add income');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Delete this income?')) {
      await deleteIncome(id);
      fetchData();
    }
  };

  const handleSavingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (savingForm.id) {
        await updateSaving(savingForm.id, { source: savingForm.source, amount: savingForm.amount, description: savingForm.description });
      } else {
        await createSaving(savingForm);
      }
      setShowSavingForm(false);
      setSavingForm({ id: null, source: '', amount: '', description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save card');
    }
  };

  const handleDeleteSaving = async (id) => {
    if (window.confirm('Delete this savings card?')) {
      await deleteSaving(id);
      fetchData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Savings & Income</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your monthly income and manage savings accounts.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <>
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-5 rounded border border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Income ({currentMonth})</h3>
              <p className="text-2xl font-bold text-positive mt-2">₹{Number(summary?.monthlyIncome || 0).toFixed(2)}</p>
            </div>
            <div className="bg-card p-5 rounded border border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Expenses ({currentMonth})</h3>
              <p className="text-2xl font-bold text-negative mt-2">₹{Number(summary?.monthlyExpenses || 0).toFixed(2)}</p>
            </div>
            <div className="bg-card p-5 rounded border border-positive">
              <h3 className="text-xs font-medium text-positive uppercase tracking-wide">Monthly Savings ({currentMonth})</h3>
              <p className="text-2xl font-bold text-positive mt-2">₹{Number(summary?.monthlySavings || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Section */}
            <div className="bg-card rounded border border-border overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-border flex justify-between items-center">
                <h2 className="text-sm font-bold text-foreground">Income Sources</h2>
                <button 
                  onClick={() => setShowIncomeForm(!showIncomeForm)}
                  className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1.5 rounded hover:bg-border transition-colors font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Income
                </button>
              </div>

              {showIncomeForm && (
                <form onSubmit={handleIncomeSubmit} className="p-4 border-b border-border space-y-3">
                  <div className="flex gap-3">
                    <input type="number" required placeholder="Amount" step="0.01" min="0.01" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} className="flex-1 rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground" />
                    <input type="date" required value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} className="rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground" />
                  </div>
                  <input type="text" placeholder="Description (Optional)" value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowIncomeForm(false)} className="text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                    <button type="submit" className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded cursor-pointer hover:bg-primary/80">Save</button>
                  </div>
                </form>
              )}

              <div className="p-0 flex-1 overflow-auto max-h-96">
                {incomes.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No income recorded this month.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {incomes.map(inc => (
                      <li key={inc.id} className="px-5 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-foreground">₹{Number(inc.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(inc.date).toLocaleDateString()} {inc.description && `- ${inc.description}`}</p>
                        </div>
                        <button onClick={() => handleDeleteIncome(inc.id)} className="text-muted-foreground hover:text-negative p-1.5 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Savings Cards Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-foreground">Manual Savings Cards</h2>
                <button 
                  onClick={() => { setSavingForm({id: null, source: '', amount: '', description: ''}); setShowSavingForm(true); }}
                  className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded hover:bg-primary/80 transition-colors font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Card
                </button>
              </div>

              {showSavingForm && (
                <form onSubmit={handleSavingSubmit} className="bg-card p-4 rounded border border-border space-y-3">
                  <h3 className="font-bold text-sm text-foreground mb-2">{savingForm.id ? 'Edit Savings Card' : 'New Savings Card'}</h3>
                  <div className="flex gap-3">
                    <input type="text" required placeholder="Name/Type (e.g. Chase)" value={savingForm.source} onChange={e => setSavingForm({...savingForm, source: e.target.value})} className="flex-1 rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground" />
                    <input type="number" required placeholder="Amount" step="0.01" min="0" value={savingForm.amount} onChange={e => setSavingForm({...savingForm, amount: e.target.value})} className="w-1/3 rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground" />
                  </div>
                  <input type="text" placeholder="Description (Optional)" value={savingForm.description} onChange={e => setSavingForm({...savingForm, description: e.target.value})} className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground" />
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setShowSavingForm(false)} className="text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                    <button type="submit" className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded cursor-pointer hover:bg-primary/80">Save Card</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savingsCards.length === 0 && !showSavingForm && (
                  <p className="text-sm text-muted-foreground col-span-2">No savings cards created yet.</p>
                )}
                {savingsCards.map(card => (
                  <div key={card.id} className="bg-card border border-border rounded p-5 relative group">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => { setSavingForm(card); setShowSavingForm(true); }} className="p-1.5 bg-muted border border-border rounded text-muted-foreground hover:text-foreground cursor-pointer"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteSaving(card.id)} className="p-1.5 bg-muted border border-border rounded text-muted-foreground hover:text-negative cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-muted p-2 rounded">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold text-sm truncate text-foreground" title={card.source}>{card.source}</h3>
                    </div>
                    <p className="text-2xl font-bold mb-1 text-foreground">₹{Number(card.amount).toFixed(2)}</p>
                    {card.description && <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>}
                    <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border">Updated: {new Date(card.updated_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Savings;
