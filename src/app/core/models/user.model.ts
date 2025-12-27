export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  roleId: number;
  isVIP: boolean;
  twoFactorEnabled: boolean;
  barberId?: number;
  isManager?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  token?: string;
  user?: User;
  message: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleId: number;
  enableTwoFactor: boolean;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  twoFactorEnabled: boolean;
  message: string;
}
