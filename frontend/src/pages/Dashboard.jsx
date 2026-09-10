import { useState, useEffect } from 'react'
import api from '../lib/api'
import { getAnalyticsSummary, getInvestments } from '../lib/apiService'
import { Server, Database, Activity, AlertCircle, SmartphoneNfc, Landmark, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [investmentsData, setInvestmentsData] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, summaryData, invData] = await Promise.all([
          api.get('/health'),
          getAnalyticsSummary({ month: new Date().toISOString().slice(0, 7) }),
          getInvestments()
        ]);
        setHealthStatus(healthRes.data);
        setAnalytics(summaryData);
        
        const totalInvested = invData.reduce((sum, i) => sum + Number(i.amount), 0);
        const currentValue = invData.reduce((sum, i) => sum + Number(i.current_value), 0);
        setInvestmentsData({ totalInvested, currentValue, count: invData.length });
        
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.username}</h1>
        <p className="text-muted-foreground mt-1">Here is the overview of your system and finances.</p>
      </div>
      
      {loading ? (
        <div className="text-muted-foreground animate-pulse">Loading dashboard...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 max-w-md">
          <h2 className="font-semibold flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5" />
            Connection Failed
          </h2>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* UPI Stats */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">UPI Expenses (This Month)</h3>
                <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><SmartphoneNfc className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-bold text-foreground">${Number(analytics?.monthlyUpiExpenses || 0).toFixed(2)}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">All-time UPI</span>
              <span className="font-medium">${Number(analytics?.totalUpiExpenses || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Investments Stats */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Invested</h3>
                <div className="bg-purple-50 text-purple-600 p-2 rounded-full"><Landmark className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-bold text-foreground">${investmentsData?.totalInvested.toFixed(2)}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current Value</span>
              <div className="flex items-center gap-1 font-medium text-purple-600">
                <span>${investmentsData?.currentValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Status
            </h2>
            <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200 mb-4">
              <h2 className="font-semibold text-sm">Healthy</h2>
            </div>
            <div className="flex flex-col gap-2 text-sm text-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Server className="w-4 h-4 text-muted-foreground" /> <span>Backend</span></div>
                <span className="font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Database className="w-4 h-4 text-muted-foreground" /> <span>Database</span></div>
                <span className="font-medium text-green-600">{healthStatus?.database}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
