import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from AsyncStorage on app start.
  useEffect(() => {
    (async () => {
      const savedUser = await storage.getUser();
      const savedToken = await storage.getToken();
      if (savedUser && savedToken) {
        setUser(savedUser);
        setToken(savedToken);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (userData, authToken) => {
    await storage.setUser(userData);
    await storage.setToken(authToken);
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(async () => {
    await storage.clear();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback(async (updates) => {
    const updated = { ...user, ...updates };
    await storage.setUser(updated);
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
