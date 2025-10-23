'use client';

import React, { createContext, useContext, useState } from 'react';
import { z } from 'zod';
import { postData } from '@/lib/api';

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['patient', 'doctor', 'admin']),
});

type User = z.infer<typeof UserSchema>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string; email?: string }) => Promise<void>;
}

interface ILoginResponse {
  message: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setLoading(true);

    const data = {
      email,
      password,
    };

    const response = await postData<ILoginResponse>('/api/v1/auth/login', data);
    setUser(response.user);
    setLoading(false);
  };

  const register = async (
    email: string,
    password: string,
    role = 'patient'
  ) => {
    setLoading(true);

    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setUser(UserSchema.parse(data.user));
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);

    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    setLoading(false);
  };

  const updateProfile = async (data: { username?: string; email?: string }) => {
    const response = await fetch('/api/v1/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }

    const result = await response.json();
    setUser(UserSchema.parse(result.user));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
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
