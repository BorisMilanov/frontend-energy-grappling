import { authStorage } from './authApi';

const API_BASE = 'http://localhost:5000/api';

export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Member {
  id: number;
  name: string;
  belt: Belt;
  createdAt: string;
}

export interface MemberPayload {
  name: string;
  belt: Belt;
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStorage.getToken()}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? 'Грешка при заявката.');
  return data as T;
}

export const membersApi = {
  getAll: async (): Promise<Member[]> => {
    const res = await fetch(`${API_BASE}/members`);
    return handleResponse<Member[]>(res) ?? [];
  },

  getById: async (id: number): Promise<Member> => {
    const res = await fetch(`${API_BASE}/members/${id}`);
    return handleResponse<Member>(res);
  },

  create: async (payload: MemberPayload): Promise<Member> => {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Member>(res);
  },

  update: async (id: number, payload: MemberPayload): Promise<Member> => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Member>(res);
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Грешка при изтриване.');
    }
  },
};
