import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useLoginFormViewModel } from './useLoginFormViewModel';
import { useAuthStore } from '../../../../infrastructure/state/AuthStore';

// Mock the auth store
vi.mock('../../../../infrastructure/state/AuthStore');
const mockUseAuthStore = useAuthStore as any;

// Mock the container to avoid DI issues in tests
vi.mock('../../../../infrastructure/di/container', () => ({
  container: {
    resolve: vi.fn(),
  },
  TOKENS: {
    AuthCommandService: 'IAuthCommandService',
  },
}));

// Helper to wrap hook with router
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useLoginFormViewModel', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockGetRememberedCredentials = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loginStatus: 'idle',
      error: null,
      getAuthHeaders: () => ({}),
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
      setToken: vi.fn(),
      checkAuthState: vi.fn(),
      getRememberedCredentials: mockGetRememberedCredentials,
      clearRememberedCredentials: vi.fn(),
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should show submitting state when loginStatus is loading', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loginStatus: 'loading',
      error: null,
      getAuthHeaders: () => ({}),
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
      setToken: vi.fn(),
      checkAuthState: vi.fn(),
    });

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.isSubmitting).toBe(true);
  });

  it('should show error when auth store has error', () => {
    const errorMessage = 'Invalid credentials';
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loginStatus: 'error',
      error: errorMessage,
      getAuthHeaders: () => ({}),
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
      setToken: vi.fn(),
      checkAuthState: vi.fn(),
    });

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle successful form submission', async () => {
    mockLogin.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    const success = await result.current.handleFormSubmit('test@example.com', 'password123');

    expect(mockLogin).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      password: 'password123',
    });
    expect(success).toBe(true);
  });

  it('should handle failed form submission', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    const success = await result.current.handleFormSubmit('test@example.com', 'wrongpassword');

    expect(mockLogin).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(success).toBe(false);
  });

  it('should call clearError when clearError is called', () => {
    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    result.current.clearError();

    expect(mockClearError).toHaveBeenCalled();
  });

  it('should validate email correctly', () => {
    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.validateEmail('test@example.com')).toBe(true);
    expect(result.current.validateEmail('invalid-email')).toBe(false);
    expect(result.current.validateEmail('user@domain')).toBe(false);
    expect(result.current.validateEmail('user@domain.com')).toBe(true);
  });

  it('should return field error when there is a general error', () => {
    const errorMessage = 'Invalid credentials';
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loginStatus: 'error',
      error: errorMessage,
      getAuthHeaders: () => ({}),
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
      setToken: vi.fn(),
      checkAuthState: vi.fn(),
    });

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.getFieldError('identifier')).toBe(errorMessage);
    expect(result.current.getFieldError('password')).toBe(errorMessage);
  });

  it('should return null for field error when no error exists', () => {
    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.getFieldError('identifier')).toBe(null);
    expect(result.current.getFieldError('password')).toBe(null);
  });

  it('should return remembered credentials when available', () => {
    const rememberedData = { identifier: 'test@example.com', rememberMe: true };
    mockGetRememberedCredentials.mockReturnValue(rememberedData);

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.getRememberedCredentials()).toEqual(rememberedData);
  });

  it('should return null when no remembered credentials available', () => {
    mockGetRememberedCredentials.mockReturnValue(null);

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    expect(result.current.getRememberedCredentials()).toBe(null);
  });

  it('should handle form submission with remember me', async () => {
    mockLogin.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLoginFormViewModel(), { wrapper });

    const success = await result.current.handleFormSubmit('test@example.com', 'password123', true);

    expect(mockLogin).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      password: 'password123',
    }, true);
    expect(success).toBe(true);
  });
});