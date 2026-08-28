export type SecurityRole = 'Security Tester' | 'Security Lead' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: SecurityRole;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: SecurityRole;
  acceptTerms: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  forgotPassword: (data: ForgotPasswordData) => Promise<AuthResponse>;
  logout: () => void;
}
