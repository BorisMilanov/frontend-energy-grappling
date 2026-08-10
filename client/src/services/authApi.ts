export const API_BASE = 'http://localhost:8000/api';
const TOKEN_KEY = 'eg_token';
const USER_KEY = 'eg_user';

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // FastAPI returns `detail` — a string for our errors, a list for validation errors.
    const detail = data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? (detail[0]?.msg ?? 'Невалидни данни.')
          : 'Грешка при заявката.';
    throw new Error(message);
  }
  return data as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export const authApi = {
  register: (payload: RegisterPayload): Promise<TokenResponse> =>
    post<TokenResponse>('/auth/register', payload),

  login: (payload: LoginPayload): Promise<TokenResponse> =>
    post<TokenResponse>('/auth/login', payload),

  me: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken() ?? ''}` },
    });
    return handleResponse<User>(res);
  },
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist the token plus the user it belongs to, so the UI can render a name offline. */
export function setSession(data: TokenResponse): void {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
