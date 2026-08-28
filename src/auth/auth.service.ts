import { User, LoginCredentials, RegisterData, ForgotPasswordData, AuthResponse } from './auth.types';

const STORAGE_KEY_USER = 'art_auth_user';
const STORAGE_KEY_TOKEN = 'art_auth_token';
const STORAGE_KEY_REGISTERED = 'art_registered_users';

// Simulated cryptographic hash representation for mock security
const mockHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hsh_${Math.abs(hash).toString(16)}_${password.length}`;
};

// Seed demo users (pre-hashed)
interface StoredUserAccount {
  user: User;
  passwordHash: string;
}

const DEFAULT_USERS: StoredUserAccount[] = [
  {
    user: {
      id: 'usr-001',
      name: 'Alex Vance (Tester)',
      email: 'tester@redteam.local',
      role: 'Security Tester',
      createdAt: '2026-01-15T08:00:00.000Z',
    },
    passwordHash: mockHash('RedTeam@2026'),
  },
  {
    user: {
      id: 'usr-002',
      name: 'Jordan Reed (Lead)',
      email: 'lead@redteam.local',
      role: 'Security Lead',
      createdAt: '2026-01-10T08:00:00.000Z',
    },
    passwordHash: mockHash('RedTeam@2026'),
  },
  {
    user: {
      id: 'usr-003',
      name: 'Morgan Blake (Viewer)',
      email: 'viewer@redteam.local',
      role: 'Viewer',
      createdAt: '2026-02-01T08:00:00.000Z',
    },
    passwordHash: mockHash('RedTeam@2026'),
  },
];

class AuthService {
  private getRegisteredUsers(): StoredUserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REGISTERED);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_USERS;
  }

  private saveRegisteredUsers(users: StoredUserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_REGISTERED, JSON.stringify(users));
    } catch {
      // ignore storage errors
    }
  }

  // Simulated latency for realistic UX
  private delay(ms = 600): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.delay(500);

    const email = credentials.email.trim().toLowerCase();
    const allUsers = this.getRegisteredUsers();
    const account = allUsers.find((acc) => acc.user.email.toLowerCase() === email);

    if (!account) {
      return {
        success: false,
        error: 'Invalid email or password. Please verify your credentials.',
      };
    }

    const providedHash = mockHash(credentials.password);
    if (account.passwordHash !== providedHash) {
      return {
        success: false,
        error: 'Invalid email or password. Please verify your credentials.',
      };
    }

    const token = `art_jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const updatedUser: User = {
      ...account.user,
      lastLogin: new Date().toISOString(),
    };

    this.setSession(updatedUser, token, !!credentials.rememberMe);

    return {
      success: true,
      user: updatedUser,
      token,
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    await this.delay(600);

    const email = data.email.trim().toLowerCase();
    const allUsers = this.getRegisteredUsers();

    if (allUsers.some((acc) => acc.user.email.toLowerCase() === email)) {
      return {
        success: false,
        error: 'An account with this email address already exists.',
      };
    }

    // Explicit security check: Prevent Admin role injection
    if ((data.role as string) === 'Admin') {
      return {
        success: false,
        error: 'Administrative registration is restricted to internal operations.',
      };
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: data.name.trim(),
      email,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    const newAccount: StoredUserAccount = {
      user: newUser,
      passwordHash: mockHash(data.password),
    };

    allUsers.push(newAccount);
    this.saveRegisteredUsers(allUsers);

    return {
      success: true,
      user: newUser,
      message: 'Account successfully registered. You can now sign in.',
    };
  }

  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    await this.delay(500);

    const email = data.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    // Simulated successful password reset dispatch
    return {
      success: true,
      message: `If an account matches ${email}, a secure password reset link has been dispatched.`,
    };
  }

  getStoredSession(): { user: User; token: string } | null {
    try {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN);
      const userJson = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        return { user, token };
      }
    } catch {
      this.clearSession();
    }
    return null;
  }

  setSession(user: User, token: string, remember = false): void {
    const storage = remember ? localStorage : sessionStorage;
    try {
      storage.setItem(STORAGE_KEY_TOKEN, token);
      storage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
  }

  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      // ignore
    }
  }
}

export const authService = new AuthService();
