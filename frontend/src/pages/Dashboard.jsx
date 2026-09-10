import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Server, Database, Activity, AlertCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health')
        setHealthStatus(response.data)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-foreground">Welcome, {user?.username}</h1>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      
      <div className="bg-card w-full max-w-md border border-border rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          System Status
        </h2>

        {loading ? (
          <div className="text-muted-foreground flex items-center gap-2">
            <span className="animate-pulse">Checking system health...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            <h2 className="font-semibold flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              Connection Failed
            </h2>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 text-green-800 rounded border border-green-200">
              <h2 className="font-semibold mb-1">Status: Healthy</h2>
              <p className="text-sm">{healthStatus?.message}</p>
            </div>
            
            <div className="flex flex-col gap-3 mt-4 text-sm text-foreground">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground" />
                <span>Backend Server: <span className="font-medium text-green-600">Online</span></span>
              </div>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-muted-foreground" />
                <span>Database: <span className="font-medium text-green-600">{healthStatus?.database}</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
