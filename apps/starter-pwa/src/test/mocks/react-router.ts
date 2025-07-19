import { vi } from 'vitest';

// Mock react-router-dom
export const mockNavigate = vi.fn();
export const mockUseLocation = vi.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
}));

export const mockUseParams = vi.fn(() => ({}));
export const mockUseSearchParams = vi.fn(() => [
  new URLSearchParams(),
  vi.fn(),
]);

// Setup global mocks for react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: mockUseLocation,
  useParams: mockUseParams,
  useSearchParams: mockUseSearchParams,
  Link: ({ children, to, ...props }: any) =>
    React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ children, to, ...props }: any) =>
    React.createElement('a', { href: to, ...props }, children),
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ element }: any) => element,
  Outlet: () => null,
}));
