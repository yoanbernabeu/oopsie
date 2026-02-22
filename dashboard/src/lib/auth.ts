'use client';

import { createContext, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('oopsie_token');
}

export function setToken(token: string): void {
  localStorage.setItem('oopsie_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('oopsie_token');
}
