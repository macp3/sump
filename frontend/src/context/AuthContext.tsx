import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AppConfig } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  partner: User | null;
  appConfig: AppConfig | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateMood: (mood: string, color?: string) => Promise<void>;
  refreshPair: () => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sump_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [partner, setPartner] = useState<User | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const config = await api.getConfig();
      setAppConfig(config);
    } catch (err) {
      console.error('Failed to load app config:', err);
    }
  };

  const refreshPair = async () => {
    try {
      const users = await api.getPair();
      if (user) {
        const currentUser = users.find((u) => u.id === user.id);
        const otherUser = users.find((u) => u.id !== user.id);
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('sump_user', JSON.stringify(currentUser));
        }
        if (otherUser) {
          setPartner(otherUser);
        }
      }
    } catch (err) {
      console.error('Failed to refresh pair status:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sump_token');
      await refreshConfig();
      
      if (token) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
          localStorage.setItem('sump_user', JSON.stringify(currentUser));
          
          const users = await api.getPair();
          const otherUser = users.find((u) => u.id !== currentUser.id);
          if (otherUser) {
            setPartner(otherUser);
          }
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('sump_token');
          localStorage.removeItem('sump_user');
          setUser(null);
          setPartner(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    localStorage.setItem('sump_token', data.access_token);
    localStorage.setItem('sump_user', JSON.stringify(data.user));
    setUser(data.user);
    
    // Fetch partner info immediately
    try {
      const users = await api.getPair();
      const otherUser = users.find((u) => u.id !== data.user.id);
      if (otherUser) {
        setPartner(otherUser);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    localStorage.removeItem('sump_token');
    localStorage.removeItem('sump_user');
    setUser(null);
    setPartner(null);
  };

  const updateMood = async (mood: string, color?: string) => {
    const updated = await api.updateMood(mood, color);
    setUser(updated);
    localStorage.setItem('sump_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        appConfig,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateMood,
        refreshPair,
        refreshConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
