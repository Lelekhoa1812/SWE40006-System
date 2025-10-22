'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://medmsg-blue.azurewebsites.net'}/api/v1/auth/me`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(UserSchema.parse(data.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://medmsg-blue.azurewebsites.net'}/api/v1/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(UserSchema.parse(data.user));
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role = 'patient'
  ) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://medmsg-blue.azurewebsites.net'}/api/v1/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, role }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setUser(UserSchema.parse(data.user));
  };

  const logout = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://medmsg-blue.azurewebsites.net'}/api/v1/auth/logout`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );
    setUser(null);
  };

  const updateProfile = async (data: { username?: string; email?: string }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://medmsg-blue.azurewebsites.net'}/api/v1/auth/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

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
