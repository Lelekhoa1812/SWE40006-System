'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Mock auth check - in real app, call /api/v1/auth/me
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Mock login - in real app, call /api/v1/auth/login
    console.log('Login:', email, password);
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    // Mock register - in real app, call /api/v1/auth/register
    console.log('Register:', username, email, role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
