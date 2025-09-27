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

  // Método para verificar si el token está expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar el JWT para verificar la fecha de expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Si no hay exp o está expirado
      return !payload.exp || payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Si no se puede decodificar, considerar expirado
    }
  },

  // Método para obtener tiempo restante del token
  getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convertir a millisegundos
    } catch (error) {
      console.error('Error decoding token expiration:', error);
      return null;
    }
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