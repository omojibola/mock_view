import { appConfig } from '@/lib/config/app.config';
import type { ApiResponse, ApiRequestOptions } from '@/lib/types/api.types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.api.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const { method = 'GET', headers = {}, body, cache } = options;

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        cache,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || 'An error occurred',
            code: data.code || 'UNKNOWN_ERROR',
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  async get<T>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
