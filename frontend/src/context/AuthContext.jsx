import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Verify token by fetching current user
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    setUser(user);
    return user;
  };

  const register = async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    const { token, user: newUser } = response.data;
    localStorage.setItem('auth_token', token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
