import { apiClient, extractLaravelData } from '@/utils/api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  LaravelUserResponse
} from '@/models';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return response;
  },

  async getMe(): Promise<User> {
    console.log('authService.getMe - Haciendo llamada a /api/auth/me...');
    
    try {
      const response = await apiClient.get<LaravelUserResponse>('/api/auth/me');
      console.log('authService.getMe - Respuesta completa:', response);
      
      const user = extractLaravelData<User>(response, 'user');
      console.log('authService.getMe - ✅ Usuario extraído:', user);
      return user;
      
    } catch (error) {
      console.error('authService.getMe - Error en la llamada:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh');
    return response;
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }
};