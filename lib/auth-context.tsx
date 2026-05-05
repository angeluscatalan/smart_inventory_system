'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from './types';

export interface AuthUser {
  username: string;
  fullName: string;
  role: UserRole;
  branch: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const CREDENTIALS: Record<string, { password: string; fullName: string; role: UserRole; branch: string }> = {
  admin: { password: 'password123', fullName: 'Administrator', role: 'admin', branch: 'all' },
  manila_manager: { password: 'manila2024', fullName: 'Maria Santos', role: 'branch-manager', branch: 'Manila Branch' },
  cebu_manager: { password: 'cebu2024', fullName: 'Juan Dela Cruz', role: 'branch-manager', branch: 'Cebu Branch' },
  davao_manager: { password: 'davao2024', fullName: 'Rosa Garcia', role: 'branch-manager', branch: 'Davao Branch' },
  manila_staff: { password: 'staff123', fullName: 'Anna Lopez', role: 'staff', branch: 'Manila Branch' },
  cebu_staff: { password: 'staff123', fullName: 'Miguel Rodriguez', role: 'staff', branch: 'Cebu Branch' },
  davao_staff: { password: 'staff123', fullName: 'Christine Reyes', role: 'staff', branch: 'Davao Branch' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (error) {
        localStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const cred = CREDENTIALS[username];
    if (cred && cred.password === password) {
      const userData: AuthUser = {
        username,
        fullName: cred.fullName,
        role: cred.role,
        branch: cred.branch,
      };
      localStorage.setItem('auth', JSON.stringify({ user: userData }));
      setIsAuthenticated(true);
      setUser(userData);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
