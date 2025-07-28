import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { injectable } from 'tsyringe';
import { IHttpClient, HttpResponse, HttpRequestConfig } from './IHttpClient';
import { ApiError } from '../api/errors/ApiError';
import { getApiConfig } from '../config';

@injectable()
export class AxiosHttpClient implements IHttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    const apiConfig = getApiConfig();
    
    this.axiosInstance = axios.create({
      baseURL: baseURL || apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - for adding auth tokens
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authorization headers from localStorage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - for handling common errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common HTTP errors
        if (error.response?.status === 401) {
          // Unauthorized - possibly expired token
          if (typeof window !== 'undefined') {
            // Clear invalid auth data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          console.warn('Unauthorized access - redirecting to login');
        } else if (error.response && error.response.status >= 500) {
          console.error('Server error:', error.response.status, error.response.statusText);
        } else if (!error.response) {
          // Network error
          throw new Error('Network error: Unable to connect to the API server');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Convert AxiosResponse to HttpResponse
   */
  private toHttpResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }

  /**
   * Convert custom HttpRequestConfig to AxiosRequestConfig
   */
  private toAxiosConfig(config?: HttpRequestConfig): AxiosRequestConfig | undefined {
    if (!config) return undefined;

    return {
      headers: config.headers,
      timeout: config.timeout,
      params: config.params,
    };
  }

  async get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, this.toAxiosConfig(config));
      return this.toHttpResponse(response);
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, this.toAxiosConfig(config));
      return this.toHttpResponse(response);
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, this.toAxiosConfig(config));
      return this.toHttpResponse(response);
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  async delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, this.toAxiosConfig(config));
      return this.toHttpResponse(response);
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, this.toAxiosConfig(config));
      return this.toHttpResponse(response);
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  /**
   * Handle Axios errors and convert to ApiError
   */
  private handleAxiosError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        // Preserve the backend error structure and create an error that mimics the HttpErrorResponse interface
        const apiError = new ApiError(
          error.message || `HTTP ${error.response.status}: ${error.response.statusText}`,
          error.response.status,
          error.response.data
        );
        
        // Add response property to match HttpErrorResponse interface
        (apiError as any).response = {
          status: error.response.status,
          data: error.response.data
        };
        
        return apiError;
      } else if (error.request) {
        // Network error - no response received
        const apiError = new ApiError(
          'Network error: Unable to connect to the API server',
          0,
          { originalError: error.message }
        );
        
        // Add code property for network errors
        (apiError as any).code = 'NETWORK_ERROR';
        
        return apiError;
      }
    }
    
    // Other error
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new ApiError(
      message,
      0,
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}