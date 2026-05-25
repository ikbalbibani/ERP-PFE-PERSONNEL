import { UserRole } from './role.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  email?: string;
  username?: string;
  roles?: unknown[];
  authorities?: unknown[];
  role?: unknown;
}

export interface AuthUser {
  email: string;
  roles: UserRole[];
  token: string;
}
