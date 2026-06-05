const API_BASE = 'http://localhost:5000/api';

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ApiError {
  message: string;
}

async function request<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).message ?? 'Грешка при заявката.');
  }

  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, firstName: string, lastName: string) =>
    request<{ message: string }>('/auth/register', { email, password, firstName, lastName }),
};

export const authStorage = {
  save: (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role }));
  },
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getToken: () => localStorage.getItem('token'),
  getUser: (): { email: string; firstName: string; lastName: string; role: string } | null => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
  isAdmin: () => {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    return JSON.parse(raw)?.role === 'admin';
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
};
