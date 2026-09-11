import { useState, useEffect } from 'react';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../lib/apiService';
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Landmark } from 'lucide-react';

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, asset_name: '', type: 'Mutual Fund', amount: '', current_value: '', purchase_date: new Date().toISOString().split('T')[0], description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getInvestments();
      setInvestments(data);
    } catch (err) {
      console.error('Failed to fetch investments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateInvestment(form.id, form);
      } else {
        await createInvestment(form);
      }
      setShowForm(false);
      setForm({ id: null, asset_name: '', type: 'Mutual Fund', amount: '', current_value: '', purchase_date: new Date().toISOString().split('T')[0], description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save investment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this investment?')) {
      await deleteInvestment(id);
      fetchData();
    }
  };

  // Aggregated Metrics
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const currentTotalValue = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGainLoss = currentTotalValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investments</h1>
          <p className="text-muted-foreground mt-1">Track your mutual funds, stocks, and other assets manually.</p>
        </div>
        <button
          onClick={() => { setForm({ id: null, asset_name: '', type: 'Mutual Fund', amount: '', current_value: '', purchase_date: new Date().toISOString().split('T')[0], description: '' }); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground cursor-pointer px-4 py-2 rounded-none font-medium hover:bg-muted text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Investment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-muted-foreground">Loading investments...</div>
      ) : (
        <>
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-none border border-border  flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Invested</h3>
                <p className="text-2xl font-bold text-foreground mt-1">₹{totalInvested.toFixed(2)}</p>
              </div>
              <div className="bg-muted p-3 rounded-none"><Landmark className="w-6 h-6 text-muted-foreground" /></div>
            </div>
            
            <div className="bg-card p-6 rounded-none border border-border  flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Total Value</h3>
                <p className="text-2xl font-bold text-foreground mt-1">₹{currentTotalValue.toFixed(2)}</p>
              </div>
            </div>

            <div className={`bg-card p-6 rounded-none border  flex items-center justify-between ${totalGainLoss >= 0 ? 'border-positive bg-muted' : 'border-negative bg-muted'}`}>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Overall Gain/Loss</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {totalGainLoss >= 0 ? '+' : '-'}₹{Math.abs(totalGainLoss).toFixed(2)}
                  </p>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-none ${totalGainLoss >= 0 ? 'bg-muted text-positive' : 'bg-muted text-negative'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              {totalGainLoss >= 0 ? <TrendingUp className="w-8 h-8 text-positive opacity-50" /> : <TrendingDown className="w-8 h-8 text-negative opacity-50" />}
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSave} className="bg-card p-6 rounded-none border border-border  space-y-4 animate-in slide-in-from-top-2">
              <h3 className="text-lg font-bold">{form.id ? 'Edit Investment' : 'Add New Investment'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1">Asset Name</label>
                  <input type="text" required placeholder="e.g. VTSAX" value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm">
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="ETF">ETF</option>
                    <option value="Stock">Stock</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount Invested</label>
                  <input type="number" required step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Value</label>
                  <input type="number" required step="0.01" min="0" value={form.current_value} onChange={e => setForm({...form, current_value: e.target.value})} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium mb-1">Purchase Date</label>
                  <input type="date" required value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="lg:col-span-4">
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground cursor-pointer rounded">Save Investment</button>
              </div>
            </form>
          )}

          {/* Cards Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.length === 0 && !showForm && (
              <p className="text-muted-foreground col-span-3 text-center py-8">No investments tracked. Add one to see your portfolio!</p>
            )}
            {investments.map(inv => {
              const invested = Number(inv.amount);
              const current = Number(inv.current_value);
              const gainLoss = current - invested;
              const percent = invested > 0 ? (gainLoss / invested) * 100 : 0;
              const isPositive = gainLoss >= 0;

              return (
                <div key={inv.id} className="bg-card border border-border rounded-none p-5  hover: transition-shadow relative group">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setForm({ ...inv, purchase_date: new Date(inv.purchase_date).toISOString().split('T')[0] }); setShowForm(true); }} className="p-1.5 bg-background border border-border rounded-none text-primary hover:bg-muted"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 bg-background border border-border rounded-none text-negative hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-4 border-b border-border pb-3">
                    <span className="text-xs font-semibold text-primary bg-muted px-2 py-0.5 rounded-none w-fit">{inv.type}</span>
                    <h3 className="font-bold text-lg leading-tight truncate pr-16" title={inv.asset_name}>{inv.asset_name}</h3>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="font-bold text-xl">₹{current.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Invested</p>
                      <p className="font-medium text-sm">₹{invested.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    {isPositive ? <TrendingUp className="w-4 h-4 text-positive" /> : <TrendingDown className="w-4 h-4 text-negative" />}
                    <span className={`text-sm font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {isPositive ? '+' : '-'}₹{Math.abs(gainLoss).toFixed(2)} ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Investments;
