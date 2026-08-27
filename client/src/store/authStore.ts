import { create } from 'zustand';
import { User, AuthState } from '../types';
import { api } from '../services/api';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setAuth: (user: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('processpilot_token', token);
      localStorage.setItem('processpilot_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, error: null, isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      get().setAuth(user, token);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed. Please check credentials.';
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw new Error(message);
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data.data;
      get().setAuth(user, token);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || err.message || 'Unable to connect to backend server. Please verify API URL.';
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw new Error(message);
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('processpilot_token');
      localStorage.removeItem('processpilot_user');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
  },

  fetchMe: async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('processpilot_user', JSON.stringify(user));
      }
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      get().logout();
    }
  },

  initializeAuth: async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('processpilot_token');
    const storedUser = localStorage.getItem('processpilot_user');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (e) {
        // Fallback to fetchMe
      }
    }

    // Always re-verify session with /auth/me
    await get().fetchMe();
  },
}));
