import { useState, useEffect } from 'react';
import { getGoals, createGoal, deleteGoal, getAnalyticsSummary } from '../lib/apiService';
import { Plus, Trash2, Target } from 'lucide-react';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [overallSavings, setOverallSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', deadline: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalData, summary] = await Promise.all([
        getGoals(),
        getAnalyticsSummary() // without month gets all-time
      ]);
      setGoals(goalData);
      setOverallSavings(summary.overallSavings || 0);
    } catch (err) {
      console.error('Failed to fetch goals data', err);
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
      await createGoal(form);
      setShowForm(false);
      setForm({ name: '', target_amount: '', deadline: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      await deleteGoal(id);
      fetchData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Track your progress using your overall savings.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full"><Target className="w-6 h-6 text-primary" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Overall Savings</p>
            <p className="text-xl font-bold text-foreground">${Number(overallSavings).toFixed(2)}</p>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground max-w-xs">
          This total is applied to calculate progress across all your goals.
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col md:flex-row items-end gap-4 animate-in slide-in-from-top-2">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <input 
              type="text" required placeholder="e.g. New Car"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Target Amount</label>
            <input 
              type="number" required min="1" step="0.01" placeholder="Amount"
              value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input 
              type="date" required
              value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded">Save</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 animate-pulse text-muted-foreground">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-card rounded border border-border">
          <p className="text-muted-foreground">No goals set yet. Add one to start tracking!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const target = Number(goal.target_amount);
            const progress = Math.max(0, Number(overallSavings));
            const percent = target > 0 ? (progress / target) * 100 : 0;
            const cappedPercent = Math.min(percent, 100);
            const remaining = Math.max(0, target - progress);
            const isAchieved = progress >= target;

            return (
              <div key={goal.id} className={`bg-card p-5 rounded-lg border shadow-sm flex flex-col relative ${isAchieved ? 'border-green-500/50 bg-green-50/5' : 'border-border'}`}>
                <div className="absolute top-4 right-4">
                  <button onClick={() => handleDelete(goal.id)} className="text-muted-foreground hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold pr-8">{goal.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                
                <div className="flex justify-between items-end mb-2">
                  <p className="text-2xl font-bold ${isAchieved ? 'text-green-600' : 'text-primary'}">
                    ${progress.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">of ${target.toFixed(2)}</p>
                </div>

                <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-500 ${isAchieved ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${cappedPercent}%` }}
                  />
                </div>
                
                <div className="flex justify-between mt-auto text-xs font-medium">
                  <span className={isAchieved ? 'text-green-600' : 'text-foreground'}>{cappedPercent.toFixed(1)}%</span>
                  {isAchieved ? (
                    <span className="text-green-600">Goal Achieved! 🎉</span>
                  ) : (
                    <span className="text-muted-foreground">${remaining.toFixed(2)} left</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Goals;
