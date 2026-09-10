import { useState, useEffect } from 'react';
import { getAnalyticsSummary, getIncome, createIncome, deleteIncome, getSavings, createSaving, updateSaving, deleteSaving } from '../lib/apiService';
import { Plus, Trash2, Pencil, Wallet } from 'lucide-react';

function Savings() {
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [savingsCards, setSavingsCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms State
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
  }, []);

  // Handlers for Income
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

  // Handlers for Savings
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Savings & Income</h1>
        <p className="text-muted-foreground mt-1">Track your monthly income and manage savings accounts.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <>
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Income ({currentMonth})</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">${Number(summary?.monthlyIncome || 0).toFixed(2)}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Expenses ({currentMonth})</h3>
              <p className="text-2xl font-bold text-red-600 mt-2">${Number(summary?.monthlyExpenses || 0).toFixed(2)}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm bg-primary/5 border-primary/20">
              <h3 className="text-sm font-medium text-primary">Monthly Savings ({currentMonth})</h3>
              <p className="text-2xl font-bold text-primary mt-2">${Number(summary?.monthlySavings || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                <h2 className="text-lg font-bold">Income Sources</h2>
                <button 
                  onClick={() => setShowIncomeForm(!showIncomeForm)}
                  className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded hover:bg-primary/20 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Income
                </button>
              </div>

              {showIncomeForm && (
                <form onSubmit={handleIncomeSubmit} className="p-4 bg-muted/10 border-b border-border space-y-3">
                  <div className="flex gap-3">
                    <input type="number" required placeholder="Amount" step="0.01" min="0.01" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} className="flex-1 rounded border-input bg-background px-3 py-1.5 text-sm" />
                    <input type="date" required value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} className="rounded border-input bg-background px-3 py-1.5 text-sm" />
                  </div>
                  <input type="text" placeholder="Description (Optional)" value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} className="w-full rounded border-input bg-background px-3 py-1.5 text-sm" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowIncomeForm(false)} className="text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground">Cancel</button>
                    <button type="submit" className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded">Save</button>
                  </div>
                </form>
              )}

              <div className="p-0 flex-1 overflow-auto max-h-96">
                {incomes.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No income recorded this month.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {incomes.map(inc => (
                      <li key={inc.id} className="p-4 flex justify-between items-center hover:bg-muted/10">
                        <div>
                          <p className="font-semibold text-sm">${Number(inc.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(inc.date).toLocaleDateString()} {inc.description && `- ${inc.description}`}</p>
                        </div>
                        <button onClick={() => handleDeleteIncome(inc.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Savings Cards Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground">Manual Savings Cards</h2>
                <button 
                  onClick={() => { setSavingForm({id: null, source: '', amount: '', description: ''}); setShowSavingForm(true); }}
                  className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" /> Create Card
                </button>
              </div>

              {showSavingForm && (
                <form onSubmit={handleSavingSubmit} className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-3">
                  <h3 className="font-bold text-sm mb-2">{savingForm.id ? 'Edit Savings Card' : 'New Savings Card'}</h3>
                  <div className="flex gap-3">
                    <input type="text" required placeholder="Name/Type (e.g. Chase)" value={savingForm.source} onChange={e => setSavingForm({...savingForm, source: e.target.value})} className="flex-1 rounded border-input bg-background px-3 py-1.5 text-sm" />
                    <input type="number" required placeholder="Amount" step="0.01" min="0" value={savingForm.amount} onChange={e => setSavingForm({...savingForm, amount: e.target.value})} className="w-1/3 rounded border-input bg-background px-3 py-1.5 text-sm" />
                  </div>
                  <input type="text" placeholder="Description (Optional)" value={savingForm.description} onChange={e => setSavingForm({...savingForm, description: e.target.value})} className="w-full rounded border-input bg-background px-3 py-1.5 text-sm" />
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setShowSavingForm(false)} className="text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground">Cancel</button>
                    <button type="submit" className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded">Save Card</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savingsCards.length === 0 && !showSavingForm && (
                  <p className="text-sm text-muted-foreground col-span-2">No savings cards created yet.</p>
                )}
                {savingsCards.map(card => (
                  <div key={card.id} className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => { setSavingForm(card); setShowSavingForm(true); }} className="p-1.5 bg-background border border-border rounded text-blue-600 hover:bg-blue-50"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteSaving(card.id)} className="p-1.5 bg-background border border-border rounded text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold truncate" title={card.source}>{card.source}</h3>
                    </div>
                    <p className="text-2xl font-bold mb-1">${Number(card.amount).toFixed(2)}</p>
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
