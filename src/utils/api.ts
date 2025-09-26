const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || '/api/auth';
const API_V1_BASE_URL = import.meta.env.VITE_API_V1_BASE_URL || '/api/v1';

export class ApiError extends Error {
  public errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

// Helper para extraer datos de respuestas Laravel con diferentes wrappers
export function extractLaravelData<T>(response: any, dataKey?: string): T {
  // Si se especifica una clave específica (ej: 'boards', 'cards', 'lists')
  if (dataKey && response[dataKey]) {
    return response[dataKey];
  }
  
  // Formato estándar { data: ... }
  if (response.data !== undefined) {
    return response.data;
  }
  
  // Si es un array directo
  if (Array.isArray(response)) {
    return response as T;
  }
  
  // Si es un objeto directo (para objetos individuales)
  if (typeof response === 'object' && response.id !== undefined) {
    return response as T;
  }
  
  throw new Error('Formato de respuesta no reconocido');
}

class ApiClient {
  private baseURL: string;
  private authBaseURL: string;
  private apiV1BaseURL: string;

  constructor(baseURL: string, authBaseURL: string, apiV1BaseURL: string) {
    this.baseURL = baseURL;
    this.authBaseURL = authBaseURL;
    this.apiV1BaseURL = apiV1BaseURL;
  }

  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('API Client - Token obtenido de localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  }

  private getFullUrl(endpoint: string): string {
    // Determinar qué URL base usar basándose en el endpoint
    if (endpoint.startsWith('/api/auth')) {
      return `${this.baseURL}${endpoint}`;
    } else if (endpoint.startsWith('/api/v1')) {
      return `${this.baseURL}${endpoint}`;
    } else if (endpoint.startsWith('/auth')) {
      // Para endpoints que empiecen con /auth (sin /api)
      return `${this.baseURL}${this.authBaseURL}${endpoint.replace('/auth', '')}`;
    } else if (endpoint.startsWith('/v1')) {
      // Para endpoints que empiecen con /v1 (sin /api)
      return `${this.baseURL}${this.apiV1BaseURL}${endpoint.replace('/v1', '')}`;
    } else {
      // Para endpoints relativos, asumir API v1
      return `${this.baseURL}${this.apiV1BaseURL}${endpoint}`;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Request - Headers:`, config.headers);

    try {
      const response = await fetch(url, config);
      console.log(`API Request - ${config.method || 'GET'} ${url}`);
      console.log('API Request - Response status:', response.status);
      
      const data = await response.json();
      console.log('API Request - Response data:', data);

      if (!response.ok) {
        console.error(`API Request - Error ${response.status}:`, data);
        throw new ApiError(data.message || 'Something went wrong', data.errors);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL, AUTH_BASE_URL, API_V1_BASE_URL);