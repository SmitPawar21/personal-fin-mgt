import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Users, User, UserPlus, ArrowLeft } from 'lucide-react';
import { verifyFamilyPassword, getUsers } from '../lib/apiService';

export default function Login() {
  const [step, setStep] = useState(1);
  const [familyPassword, setFamilyPassword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyFamilyPassword(familyPassword);
      const fetchedUsers = await getUsers();
      setUsersList(fetchedUsers);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid family password');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (selectedUsername) => {
    setUsername(selectedUsername);
    setPassword('');
    setError('');
    setStep(3);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const goBackToUsers = () => {
    setStep(2);
    setError('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm border border-border rounded p-6 relative">
        
        {/* Back Button for Steps 3 and 4 */}
        {(step === 3 || step === 4) && (
          <button 
            onClick={goBackToUsers}
            className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center mb-6 pt-2">
          <div className="p-3 bg-muted rounded mb-3">
            {step === 1 && <Lock className="w-6 h-6 text-foreground" />}
            {step === 2 && <Users className="w-6 h-6 text-foreground" />}
            {step === 3 && <User className="w-6 h-6 text-foreground" />}
            {step === 4 && <UserPlus className="w-6 h-6 text-foreground" />}
          </div>
          <h1 className="text-xl font-semibold text-foreground text-center">
            {step === 1 && "Family Finance App"}
            {step === 2 && "Who's using the app?"}
            {step === 3 && `Welcome back, ${username}`}
            {step === 4 && "Add Family Member"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {step === 1 && "Enter the family password to proceed"}
            {step === 2 && "Select your profile or create a new one"}
            {step === 3 && "Enter your personal password"}
            {step === 4 && "Register a new profile"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-negative/10 text-negative text-sm border border-negative/30 rounded">
            {error}
          </div>
        )}

        {/* STEP 1: FAMILY PASSWORD */}
        {step === 1 && (
          <form onSubmit={handleFamilySubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Family Password"
                value={familyPassword}
                onChange={(e) => setFamilyPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground cursor-pointer font-medium rounded hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        )}

        {/* STEP 2: SELECT USER */}
        {step === 2 && (
          <div className="space-y-3">
            {usersList.length > 0 ? (
              <div className="space-y-2 mb-4">
                {usersList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.username)}
                    className="w-full flex items-center gap-3 p-3 border border-border rounded hover:bg-muted transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium flex-1">{user.username}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center mb-4">No users found. Please create one.</p>
            )}

            <button
              onClick={() => { setUsername(''); setPassword(''); setError(''); setStep(4); }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-muted-foreground text-muted-foreground font-medium rounded hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add New Family Member
            </button>
          </div>
        )}

        {/* STEP 3: LOGIN */}
        {step === 3 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground cursor-pointer font-medium rounded hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* STEP 4: REGISTER */}
        {step === 4 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                New Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Personal Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground cursor-pointer font-medium rounded hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
