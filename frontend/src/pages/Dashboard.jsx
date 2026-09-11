import { useState, useEffect } from 'react'
import { getAnalyticsSummary, getInvestments, getBudgets, getGoals } from '../lib/apiService'
import { getExpenses } from '../lib/expenseService'
import { AlertCircle, SmartphoneNfc, Landmark, Target, Wallet, Calendar, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  
  const currentCalendarMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentCalendarMonth);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investmentsData, setInvestmentsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          summaryData,
          expData,
          budData,
          goalsData,
          invData
        ] = await Promise.all([
          getAnalyticsSummary({ month: selectedMonth }),
          getExpenses({ month: selectedMonth }),
          getBudgets({ month: selectedMonth }),
          getGoals(),
          getInvestments()
        ]);
        
        setAnalytics(summaryData);
        setExpenses(expData);
        setBudgets(budData);
        setGoals(goalsData);
        
        const totalInvested = invData.reduce((sum, i) => sum + Number(i.amount), 0);
        const currentValue = invData.reduce((sum, i) => sum + Number(i.current_value), 0);
        setInvestmentsData({ totalInvested, currentValue, gainLoss: currentValue - totalInvested });
        
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData()
  }, [selectedMonth])

  // Calculations
  const overallBudget = budgets.find(b => b.category === 'Overall');
  const overallBudgetAmount = overallBudget ? Number(overallBudget.amount) : 0;
  const remainingBudget = overallBudgetAmount > 0 ? overallBudgetAmount - Number(analytics?.monthlyExpenses || 0) : 0;

  // Chart 1: Income vs Expense data
  const monthlyIncome = Number(analytics?.monthlyIncome || 0);
  const monthlyExpenses = Number(analytics?.monthlyExpenses || 0);
  const maxIncExp = Math.max(monthlyIncome, monthlyExpenses, 1);
  const incPercent = (monthlyIncome / maxIncExp) * 100;
  const expPercent = (monthlyExpenses / maxIncExp) * 100;

  // Chart 2: Category-wise expenses
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});
  
  const categoryArray = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({ cat, amt }))
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 5);
    
  const maxCatAmt = categoryArray.length > 0 ? categoryArray[0].amt : 1;

  // Recent Expenses
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.username}</h1>
          <p className="text-muted-foreground text-sm mt-1">Here is your financial overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-foreground"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse">Loading dashboard data...</div>
      ) : error ? (
        <div className="bg-negative/10 text-negative p-4 rounded border border-negative/30">
          <h2 className="font-semibold flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5" /> Error Loading Data</h2>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* MONTHLY OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded border border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Income</h3>
              <p className="text-2xl font-bold text-positive mt-2">₹{monthlyIncome.toFixed(2)}</p>
            </div>
            <div className="bg-card p-5 rounded border border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Expenses</h3>
              <p className="text-2xl font-bold text-negative mt-2">₹{monthlyExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-card p-5 rounded border border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Savings</h3>
              <p className="text-2xl font-bold text-foreground mt-2">₹{Number(analytics?.monthlySavings || 0).toFixed(2)}</p>
            </div>
            <div className={`bg-card p-5 rounded border ${remainingBudget < 0 ? 'border-negative' : 'border-border'}`}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Remaining Budget {overallBudgetAmount === 0 && '(Not Set)'}
              </h3>
              <p className={`text-2xl font-bold mt-2 ${remainingBudget < 0 ? 'text-negative' : 'text-foreground'}`}>
                ₹{remainingBudget.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CHART 1: Income vs Expense */}
            <div className="bg-card p-5 rounded border border-border">
              <h2 className="text-sm font-bold mb-5 text-foreground">Income vs Expense</h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground text-xs">Income</span>
                    <span className="font-bold text-positive text-sm">₹{monthlyIncome.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-positive rounded" style={{ width: `${incPercent}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground text-xs">Expense</span>
                    <span className="font-bold text-negative text-sm">₹{monthlyExpenses.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-negative rounded" style={{ width: `${expPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CHART 2: Category-wise Expenses */}
            <div className="bg-card p-5 rounded border border-border">
              <h2 className="text-sm font-bold mb-5 text-foreground">Top Spending Categories</h2>
              {categoryArray.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded this month.</p>
              ) : (
                <div className="space-y-3">
                  {categoryArray.map(c => (
                    <div key={c.cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground text-xs truncate pr-4">{c.cat}</span>
                        <span className="font-bold whitespace-nowrap text-sm">₹{c.amt.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-primary rounded" style={{ width: `${(c.amt / maxCatAmt) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* BUDGETS PROGRESS */}
            <div className="bg-card p-5 rounded border border-border lg:col-span-1 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground"><Wallet className="w-4 h-4 text-muted-foreground" /> Budget Progress</h2>
              {budgets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No budgets set for this month.</p>
              ) : (
                <div className="space-y-4 flex-1">
                  {budgets.slice(0, 4).map(b => {
                    const actual = b.category === 'Overall' 
                      ? monthlyExpenses 
                      : expenses.filter(e => e.category === b.category).reduce((sum, e) => sum + Number(e.amount), 0);
                    const target = Number(b.amount);
                    const percent = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
                    const isOver = actual > target;

                    return (
                      <div key={b.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-xs text-muted-foreground truncate pr-2">{b.category}</span>
                          <span className={`font-bold text-xs ${isOver ? 'text-negative' : 'text-muted-foreground'}`}>
                            ₹{actual.toFixed(0)} / ₹{target.toFixed(0)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                          <div className={`h-full rounded ${isOver ? 'bg-negative' : 'bg-positive'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SAVINGS & GOALS */}
            <div className="bg-card p-5 rounded border border-border lg:col-span-1 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground"><Target className="w-4 h-4 text-muted-foreground" /> Active Goals</h2>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active savings goals.</p>
              ) : (
                <div className="space-y-4 flex-1">
                  {goals.slice(0, 4).map(g => {
                    const progress = Math.max(0, Number(analytics?.overallSavings || 0));
                    const target = Number(g.target_amount);
                    const percent = target > 0 ? Math.min((progress / target) * 100, 100) : 0;
                    return (
                      <div key={g.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-xs text-muted-foreground truncate pr-2">{g.name}</span>
                          <span className="font-bold text-xs text-positive">{percent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                          <div className="h-full bg-positive rounded" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* UPI & INVESTMENTS SUMMARY */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <div className="bg-card p-5 rounded border border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Monthly UPI Spend</h3>
                  <p className="text-2xl font-bold text-foreground">₹{Number(analytics?.monthlyUpiExpenses || 0).toFixed(2)}</p>
                </div>
                <div className="bg-muted p-2.5 rounded"><SmartphoneNfc className="w-5 h-5 text-muted-foreground" /></div>
              </div>

              <div className="bg-card p-5 rounded border border-border flex-1 flex flex-col justify-center">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1"><Landmark className="w-3.5 h-3.5"/> Investments</h3>
                <p className="text-2xl font-bold text-foreground">₹{investmentsData?.currentValue.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  {investmentsData?.gainLoss >= 0 ? <TrendingUp className="w-4 h-4 text-positive" /> : <TrendingDown className="w-4 h-4 text-negative" />}
                  <span className={investmentsData?.gainLoss >= 0 ? 'text-positive' : 'text-negative'}>
                    {investmentsData?.gainLoss >= 0 ? '+' : '-'}₹{Math.abs(investmentsData?.gainLoss || 0).toFixed(2)} Total Return
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT EXPENSES */}
          <div className="bg-card rounded border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-sm font-bold flex items-center gap-2 text-foreground"><Clock className="w-4 h-4 text-muted-foreground" /> Recent Expenses</h2>
            </div>
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No expenses recorded this month.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">{exp.category}</span>
                        </td>
                        <td className="px-5 py-3 truncate max-w-[200px] text-foreground">{exp.description || '-'}</td>
                        <td className="px-5 py-3 text-right font-bold whitespace-nowrap text-foreground">₹{Number(exp.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  )
}

export default Dashboard
