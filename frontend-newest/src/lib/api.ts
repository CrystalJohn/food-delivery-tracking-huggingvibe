import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { authStorage } from '@/features/auth/auth.storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const AUTH_ENDPOINT_PREFIXES = ['/auth/login', '/auth/register'];
const AUTH_PAGES = ['/login', '/register'];

function toArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return undefined;
}

function normalizeRequestPath(url?: string): string {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url, API_BASE_URL);
    return parsedUrl.pathname.replace(/\/+$/, '');
  } catch {
    return url.split('?')[0].replace(/\/+$/, '');
  }
}

function isAuthEndpoint(url?: string): boolean {
  const normalizedPath = normalizeRequestPath(url);
  return AUTH_ENDPOINT_PREFIXES.some((prefix) => normalizedPath.endsWith(prefix));
}

function shouldRedirectOnUnauthorized(error: AxiosError): boolean {
  if (error.response?.status !== 401) return false;
  if (isAuthEndpoint(error.config?.url)) return false;
  if (typeof window === 'undefined') return false;
  return !AUTH_PAGES.includes(window.location.pathname);
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.removeToken();

      if (shouldRedirectOnUnauthorized(error)) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function readErrorMessage(data: Record<string, unknown>, fallback: string): string {
  const rawMessage = data?.message;

  if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
    return rawMessage;
  }

  const messageList = toArray(rawMessage);
  if (messageList && messageList.length > 0) {
    return messageList.join(', ');
  }

  return fallback;
}

function transformError(error: AxiosError): ApiError {
  if (error.response) {
    const data = (error.response.data as Record<string, unknown>) || {};
    const rawErrors = data?.errors;

    return new ApiError(
      error.response.status,
      readErrorMessage(data, error.message),
      typeof rawErrors === 'object' && rawErrors !== null
        ? (rawErrors as Record<string, string[]>)
        : undefined,
    );
  }

  if (error.request) {
    return new ApiError(0, 'Network error. Please check your connection.');
  }

  return new ApiError(0, error.message);
}

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return (await axiosInstance.get(url, config)) as T;
    } catch (error) {
      throw transformError(error as AxiosError);
    }
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      return (await axiosInstance.post(url, data, config)) as T;
    } catch (error) {
      throw transformError(error as AxiosError);
    }
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      return (await axiosInstance.put(url, data, config)) as T;
    } catch (error) {
      throw transformError(error as AxiosError);
    }
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      return (await axiosInstance.patch(url, data, config)) as T;
    } catch (error) {
      throw transformError(error as AxiosError);
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return (await axiosInstance.delete(url, config)) as T;
    } catch (error) {
      throw transformError(error as AxiosError);
    }
  },
};

export { axiosInstance };
export const API_URL = API_BASE_URL;
export default api;
