import * as SecureStore from "expo-secure-store";
import client from "./client";
import { API_BASE_URL } from "@/constants/api";
import type { AuthUser, LoginRequest, RegisterRequest, TokenResponse } from "@/types/auth";
import axios from "axios";

export const authApi = {
  login: async (payload: LoginRequest): Promise<TokenResponse> => {
    const { data } = await axios.post<TokenResponse>(
      `${API_BASE_URL}/auth/login`,
      payload
    );
    return data;
  },

  register: async (payload: RegisterRequest): Promise<TokenResponse> => {
    const { data } = await axios.post<TokenResponse>(
      `${API_BASE_URL}/auth/register`,
      payload
    );
    return data;
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await client.get<AuthUser>("/auth/me");
    return data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const { data } = await axios.post<TokenResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken }
    );
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await client.post("/auth/logout", { refresh_token: refreshToken });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await client.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
