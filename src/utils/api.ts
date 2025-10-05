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
export function extractLaravelData<T>(response: unknown, dataKey?: string): T {
  const res = response as Record<string, unknown>;
  
  // Si se especifica una clave específica (ej: 'boards', 'cards', 'lists')
  if (dataKey && res[dataKey]) {
    return res[dataKey] as T;
  }
  
  // Formato estándar { data: ... }
  if (res.data !== undefined) {
    return res.data as T;
  }
  
  // Si es un array directo
  if (Array.isArray(res)) {
    return res as T;
  }
  
  // Si es un objeto directo (para objetos individuales)
  if (typeof res === 'object' && res !== null && 'id' in res) {
    return res as T;
  }
  
  throw new Error('Formato de respuesta no reconocido');
}

class ApiClient {
  private baseURL: string;
  private authBaseURL: string;
  private apiV1BaseURL: string;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

  constructor(baseURL: string, authBaseURL: string, apiV1BaseURL: string) {
    this.baseURL = baseURL;
    this.authBaseURL = authBaseURL;
    this.apiV1BaseURL = apiV1BaseURL;
  }

  private shouldExcludeAuth(endpoint: string): boolean {
    // Rutas que NO necesitan token de autenticación
    const authExcludePaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password'
    ];
    
    return authExcludePaths.some(path => endpoint.includes(path));
  }

  private async refreshAuthToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.token;
      
      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        console.log('✅ Token refreshed successfully');
        return newToken;
      }
      
      throw new Error('No token in refresh response');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Limpiar token inválido y redirigir al login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
      throw error;
    }
  }

  private async processQueue(error: Error | null, token: string | null = null): Promise<void> {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    
    this.failedQueue = [];
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
    
    // Solo incluir el token si NO es una ruta de autenticación
    const shouldIncludeAuth = !this.shouldExcludeAuth(endpoint);

    const makeRequest = async (authToken: string | null): Promise<Response> => {
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authToken && shouldIncludeAuth && { 'Authorization': `Bearer ${authToken}` }),
          ...options.headers,
        },
        ...options,
      };

      return fetch(url, config);
    };

    console.log(`API Request - ${options.method || 'GET'} ${url}`);
    console.log(`API Request - Include Auth: ${shouldIncludeAuth}`);
    if (import.meta.env.DEV && options.method && (options.method === 'POST' || options.method === 'PUT')) {
      try {
        console.log('API Request - Body:', options.body ? JSON.parse(options.body as string) : null);
      } catch (err) {
        console.log('API Request - Body (raw):', options.body, 'parse error:', err);
      }
    }

    try {
      let response = await makeRequest(token);
      
      // Si la respuesta es 401 (Unauthorized) y no es una ruta de auth, intentar refresh
      if (response.status === 401 && shouldIncludeAuth && !this.shouldExcludeAuth(endpoint)) {
        console.log('🔄 Token expired, attempting refresh...');
        
        if (this.isRefreshing) {
          // Si ya estamos refrescando, agregar a la cola
          return new Promise<T>((resolve, reject) => {
            this.failedQueue.push({
              resolve: (newToken: string) => {
                makeRequest(newToken)
                  .then(response => response.json())
                  .then(resolve)
                  .catch(reject);
              },
              reject
            });
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAuthToken();
          await this.processQueue(null, newToken);
          
          // Reintentar la petición original con el nuevo token
          response = await makeRequest(newToken);
        } catch (refreshError) {
          await this.processQueue(refreshError as Error);
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      console.log('API Request - Response status:', response.status);
      
  const data: unknown = await response.json();
  console.log('API Request - Response data:', data);
  const respObj = (data && typeof data === 'object' && data !== null) ? (data as Record<string, unknown>) : undefined;

      if (!response.ok) {
        console.error(`API Request - Error ${response.status}:`, data);
        // If the server returned validation errors but no message, prefer the
        // first validation message so consumers that use err.message show
        // something actionable instead of the generic text.
        let message: string = 'Something went wrong';
        if (respObj) {
          if (typeof respObj.message === 'string') {
            message = respObj.message;
          } else if (respObj.errors && typeof respObj.errors === 'object') {
            const errs = respObj.errors as Record<string, unknown>;
            // Flatten values and pick the first string message if available
            const first = Object.values(errs)
              .flatMap(v => Array.isArray(v) ? v : [v])
              .find(x => typeof x === 'string') as string | undefined;
            if (first) message = first;
          }
        }

        throw new ApiError(message, respObj ? (respObj.errors as Record<string, string[]>) : undefined);
      }

  return data as T;
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