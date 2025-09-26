import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/models';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
          authService.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext - Iniciando login...');
    
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
      console.log('AuthContext - Usando respuesta mock:', mockResponse);
      authService.setToken(mockResponse.token);
      setUser(mockResponse.user);
      console.log('AuthContext - Usuario establecido:', mockResponse.user);
      return;
    }
    
    try {
      // Login y obtener token
      const response = await authService.login({ email, password });
      console.log('AuthContext - Respuesta del login:', response);
      
      // Guardar token
      authService.setToken(response.token);
      
      // Obtener datos del usuario con el token
      console.log('AuthContext - Obteniendo datos del usuario...');
      const userData = await authService.getMe();
      console.log('AuthContext - Datos del usuario obtenidos:', userData);
      
      if (!userData) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }
      
      setUser(userData);
      console.log('AuthContext - Usuario establecido:', userData);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    console.log('AuthContext - Iniciando registro...');
    
    // TEMPORAL: Mock para testing sin backend
    if (password === passwordConfirmation && email.includes('@')) {
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 2,
          name: name,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      console.log('AuthContext - Usando respuesta mock para registro:', mockResponse);
      authService.setToken(mockResponse.token);
      setUser(mockResponse.user);
      console.log('AuthContext - Usuario registrado y establecido:', mockResponse.user);
      return;
    }
    
    try {
      // Registro y obtener token
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      console.log('AuthContext - Respuesta del registro:', response);
      
      // Guardar token
      authService.setToken(response.token);
      
      // Obtener datos del usuario con el token
      console.log('AuthContext - Obteniendo datos del usuario después del registro...');
      const userData = await authService.getMe();
      console.log('AuthContext - Datos del usuario obtenidos:', userData);
      
      if (!userData) {
        throw new Error('No se pudieron obtener los datos del usuario después del registro');
      }
      
      setUser(userData);
      console.log('AuthContext - Usuario establecido:', userData);
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};