import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { container, TOKENS } from '../di/container';
import { LoginUserCommand } from '@nx-starter/application-shared';
import type { AuthStore } from './AuthStoreInterface';
import type { IAuthCommandService } from '@nx-starter/application-shared';
import { extractErrorMessage } from '../utils/ErrorMapping';

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => {
        // Lazy resolve CQRS services - proper separation of concerns
        const getCommandService = () =>
          container.resolve<IAuthCommandService>(TOKENS.AuthCommandService);

        return {
          // Initial state
          isAuthenticated: false,
          user: null,
          token: null,
          loginStatus: 'idle',
          error: null,

          // Computed values as functions
          getAuthHeaders(): Record<string, string> {
            const { token } = get();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },

          // Actions
          async login(credentials: { identifier: string; password: string }, rememberMe = false) {
            set((state) => {
              state.loginStatus = 'loading';
              state.error = null;
            });

            try {
              const command: LoginUserCommand = {
                identifier: credentials.identifier,
                password: credentials.password,
              };

              const response = await getCommandService().login(command);
              
              console.log('🔐 AuthStore received login response:', response);
              console.log('🔐 AuthStore checking token:', response.token);

              set((state) => {
                state.isAuthenticated = true;
                state.user = response.user;
                state.token = response.token;
                state.loginStatus = 'success';
                state.error = null;
              });

              // Always store auth token in localStorage for persistent authentication
              if (typeof window !== 'undefined') {
                // Only store if we have valid data
                if (response.token) {
                  console.log('🔐 AuthStore storing token in localStorage:', response.token);
                  localStorage.setItem('auth_token', response.token);
                } else {
                  console.warn('🔐 AuthStore: No token received to store!');
                }
                
                if (response.user) {
                  console.log('🔐 AuthStore storing user in localStorage:', response.user);
                  localStorage.setItem('auth_user', JSON.stringify(response.user));
                } else {
                  console.warn('🔐 AuthStore: No user received to store!');
                }
                
                // Store remember me state and identifier if rememberMe is checked
                if (rememberMe) {
                  localStorage.setItem('remember_me', 'true');
                  localStorage.setItem('remembered_identifier', credentials.identifier);
                } else {
                  // Clear remember me data if not checked
                  localStorage.removeItem('remember_me');
                  localStorage.removeItem('remembered_identifier');
                }
              }
            } catch (error: unknown) {
              set((state) => {
                state.loginStatus = 'error';
                // Use unified error extraction utility
                state.error = extractErrorMessage(error);
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
              });
            }
          },

          logout() {
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
              state.loginStatus = 'idle';
              state.error = null;
            });

            // Clear authentication data from localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
              try {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                // Keep remember me data for next login
                // localStorage.removeItem('remember_me');
                // localStorage.removeItem('remembered_identifier');
              } catch (error) {
                // Handle cases where localStorage is not available or throws errors
                console.warn('Failed to clear localStorage during logout:', error);
              }
            }
          },

          clearError() {
            set((state) => {
              state.error = null;
            });
          },

          setToken(token: string) {
            set((state) => {
              state.token = token;
              state.isAuthenticated = true;
            });
          },

          checkAuthState() {
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('auth_token');
              const userJson = localStorage.getItem('auth_user');
              
              if (token && userJson) {
                try {
                  const user = JSON.parse(userJson);
                  set((state) => {
                    state.isAuthenticated = true;
                    state.user = user;
                    state.token = token;
                  });
                } catch {
                  // Invalid stored data, clear it
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('auth_user');
                }
              }
            }
          },

          // Remember me functionality
          getRememberedCredentials() {
            if (typeof window !== 'undefined') {
              const rememberMe = localStorage.getItem('remember_me') === 'true';
              const identifier = localStorage.getItem('remembered_identifier');
              
              if (rememberMe && identifier) {
                return { identifier, rememberMe };
              }
            }
            return null;
          },

          clearRememberedCredentials() {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('remember_me');
              localStorage.removeItem('remembered_identifier');
            }
          },
        };
      }),
      {
        name: 'auth-store',
      }
    )
  )
);