import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useLogoutViewModel } from './useLogoutViewModel';
import { useAuthStore } from '../../../../infrastructure/state/AuthStore';

// Mock the auth store
vi.mock('../../../../infrastructure/state/AuthStore');
const mockUseAuthStore = useAuthStore as any;

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to wrap hook with router
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useLogoutViewModel', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      token: 'mock-token',
      loginStatus: 'idle',
      error: null,
      logout: mockLogout,
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useLogoutViewModel(), { wrapper });

    expect(result.current.isLoggingOut).toBe(false);
    expect(typeof result.current.handleLogout).toBe('function');
  });

  it('should show logging out state when loginStatus is loading', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      token: 'mock-token',
      loginStatus: 'loading',
      error: null,
      logout: mockLogout,
    });

    const { result } = renderHook(() => useLogoutViewModel(), { wrapper });

    expect(result.current.isLoggingOut).toBe(true);
  });

  it('should call logout and navigate when handleLogout is called', () => {
    const { result } = renderHook(() => useLogoutViewModel(), { wrapper });

    result.current.handleLogout();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('should use replace navigation to prevent back navigation', () => {
    const { result } = renderHook(() => useLogoutViewModel(), { wrapper });

    result.current.handleLogout();

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
