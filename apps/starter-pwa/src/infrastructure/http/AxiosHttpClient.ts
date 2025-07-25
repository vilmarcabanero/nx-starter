import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { injectable } from 'tsyringe';
import { IHttpClient, HttpResponse, HttpRequestConfig } from './IHttpClient';

@injectable()
export class AxiosHttpClient implements IHttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - for adding auth tokens in the future
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Future: Add authorization headers here
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
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
          // Future: Handle unauthorized access
          console.warn('Unauthorized access - consider implementing auth redirect');
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

  private mapResponse<T>(axiosResponse: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: axiosResponse.data,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
    };
  }

  async get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, {
        headers: config?.headers,
        timeout: config?.timeout,
        params: config?.params,
      });
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, {
        headers: config?.headers,
        timeout: config?.timeout,
        params: config?.params,
      });
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, {
        headers: config?.headers,
        timeout: config?.timeout,
        params: config?.params,
      });
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, {
        headers: config?.headers,
        timeout: config?.timeout,
        params: config?.params,
      });
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, {
        headers: config?.headers,
        timeout: config?.timeout,
        params: config?.params,
      });
      return this.mapResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        return new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        return new Error('Network error: Unable to connect to the API server');
      }
    }
    
    // Something else happened
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}