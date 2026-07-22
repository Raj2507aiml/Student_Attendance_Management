import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { ensureSeeded } from '../services/seed';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  ensureSeeded();
  const [session, setSession] = useState(() => authService.getSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(authService.getSession());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, remember) => {
    const result = await authService.login(email, password, remember);
    setSession(authService.getSession());
    return result;
  }, []);

  const signup = useCallback(async (payload) => {
    const result = await authService.signup(payload);
    setSession(authService.getSession());
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const value = {
    session,
    user: session,
    isAuthenticated: Boolean(session),
    role: session?.role || null,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
