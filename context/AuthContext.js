'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.getMe(storedToken)
        .then(response => {
          // Correctly extract the user object from the response data
          if (response && response.data && response.data.user) {
            setUser(response.data.user);
          }
        })
        .catch(() => {
          // Handle cases where the token is invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    if (response && response.token && response.data && response.data.user) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.data.user);
      return response.data.user;
    } else {
      throw new Error('Invalid data structure received from server.');
    }
  };
  
  const signup = async (userData) => {
    const formattedRole = userData.role === 'aidrequester' ? 'aid_requester' : userData.role;
    await api.signup({ ...userData, role: formattedRole });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);