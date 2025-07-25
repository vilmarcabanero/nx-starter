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
        return new ApiError(
          `HTTP ${error.response.status}: ${error.response.statusText}`,
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // Network error - no response received
        return new ApiError(
          'Network error: Unable to connect to the API server',
          0,
          { originalError: error.message }
        );
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