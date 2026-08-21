import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, getToken, setToken } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { User, AuthResponse, Role } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  demoLogin: (role: Role) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((data: AuthResponse): User => {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => undefined);
    clearSession();
  }, [clearSession]);

  // Restore session on load.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // Auto-logout when the API reports an expired session.
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      return applyAuth(res.data);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
      return applyAuth(res.data);
    },
    [applyAuth],
  );

  const demoLogin = useCallback(
    async (role: Role) => {
      const res = await api.post<AuthResponse>('/auth/demo', { role });
      return applyAuth(res.data);
    },
    [applyAuth],
  );

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    demoLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
