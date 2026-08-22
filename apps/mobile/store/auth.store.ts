import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setTokens: (accessToken) => set({ accessToken, isAuthenticated: true }),
  clearTokens: () => set({ accessToken: null, isAuthenticated: false }),
}));
