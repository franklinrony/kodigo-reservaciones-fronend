import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/models';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  tokenExpiresIn: number | null;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('AuthContext - initAuth error:', error);
          authService.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // TEMPORAL: Mock para testing sin backend
    if (email === 'test@test.com' && password === 'test123') {
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Usuario de Prueba',
          email: 'test@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      authService.setToken(mockResponse.token);
      setUser(mockResponse.user);
      return;
    }

    try {
      // Login y obtener token
      const response = await authService.login({ email, password });

      // Guardar token
      authService.setToken(response.token);

      // Obtener datos del usuario con el token
      const userData = await authService.getMe();

      if (!userData) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }

      setUser(userData);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    // NOTE: Previously there was a development mock here that short-circuited
    // the real registration request. Remove the mock so the app always calls
    // the backend via authService.register and then fetches the current user.

    try {
      // Registro y obtener token
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // Guardar token
      authService.setToken(response.token);

      // Obtener datos del usuario con el token
      const userData = await authService.getMe();

      if (!userData) {
        throw new Error('No se pudieron obtener los datos del usuario después del registro');
      }

      setUser(userData);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    authService.logout().catch(() => {
      // Ignore logout errors on the server
    });
  };
  // Minimal implementations for fields required by the context type
  const tokenExpiresIn = null;
  const refreshToken = async () => {
    try {
      // Try to refresh token via authService; return false if not implemented
      if (typeof authService.refreshToken === 'function') {
        await authService.refreshToken();
        return true;
      }
      return false;
    } catch (e) {
      console.error('AuthContext - refreshToken error:', e);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    tokenExpiresIn,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};