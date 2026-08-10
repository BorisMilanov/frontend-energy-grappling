const API_BASE = 'http://localhost:5000/api';

export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Member {
  id: number;
  name: string;
  belt: Belt;
  createdAt: string;
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
};
