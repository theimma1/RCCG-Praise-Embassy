import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync("access_token", accessToken);
    await SecureStore.setItemAsync("refresh_token", refreshToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (refreshToken) {
        // Fire-and-forget server-side revocation
        const { authApi } = await import("@/api/auth");
        await authApi.logout(refreshToken).catch(() => null);
      }
    } finally {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;

      const { authApi } = await import("@/api/auth");
      const user = await authApi.getMe();
      set({ user, accessToken: token, isAuthenticated: true });
    } catch {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
    } finally {
      set({ isLoading: false });
    }
  },
}));
