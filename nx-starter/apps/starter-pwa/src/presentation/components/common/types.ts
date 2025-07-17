export interface ErrorBannerViewModel {
  hasError: boolean;
  error: string | null;
  dismiss: () => void;
  retry: () => void;
}

export interface TodoStore {
  error: string | null;
  clearError: () => void;
  loadTodos: () => void;
}
