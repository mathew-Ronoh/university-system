import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { setTokens, clearTokens, getTokens, setUserData, getUserData } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const { accessToken } = await getTokens();
      if (accessToken) {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        await setUserData(data.user);
      }
    } catch {
      await clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await setTokens(data.accessToken, data.refreshToken);
    await setUserData(data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    await clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
