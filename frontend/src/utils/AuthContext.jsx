import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored && authService.isAuthenticated()) {
      const normalizedUser = {
        ...stored,
        userId: stored.userId ?? stored.id ?? null,
      };
      setUser(normalizedUser);
      const token = authService.getToken();
      if (token) {
        authService.setSession(token, normalizedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const normalizedUser = {
      ...userData,
      userId: userData.userId ?? userData.id ?? null,
    };
    authService.setSession(token, normalizedUser);
    setUser(normalizedUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
