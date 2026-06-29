export interface AuthUser {
  id: string;
  email: string;
  role: string;
  campus_id: string | null;
  is_verified: boolean;
  two_fa_enabled: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}
