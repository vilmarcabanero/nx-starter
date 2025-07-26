import { AxiosHttpClient } from './AxiosHttpClient';
import { IHttpClient } from './IHttpClient';

export class HttpClientFactory {
  private static instances: Map<string, IHttpClient> = new Map();

  static create(baseURL?: string): IHttpClient {
    const key = baseURL || 'default';
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new AxiosHttpClient(baseURL));
    }
    
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`Failed to create HTTP client for key: ${key}`);
    }
    
    return instance;
  }

  static createForService(serviceName: string, baseURL?: string): IHttpClient {
    return this.create(baseURL);
  }

  static clear(): void {
    this.instances.clear();
  }
}