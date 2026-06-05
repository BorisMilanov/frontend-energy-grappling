import { authStorage } from './authApi';

const API_BASE = 'http://localhost:5000/api';

export type EventType = 'success' | 'warning' | 'error' | 'default' | 'seminar';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // ISO string
  type: EventType;
  createdAt: string;
}

export interface CalendarEventPayload {
  title: string;
  date: string; // ISO string
  type: EventType;
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

export const calendarApi = {
  getAll: async (): Promise<CalendarEvent[]> => {
    const res = await fetch(`${API_BASE}/calendar`);
    return handleResponse<CalendarEvent[]>(res);
  },

  getById: async (id: number): Promise<CalendarEvent> => {
    const res = await fetch(`${API_BASE}/calendar/${id}`);
    return handleResponse<CalendarEvent>(res);
  },

  create: async (payload: CalendarEventPayload): Promise<CalendarEvent> => {
    const res = await fetch(`${API_BASE}/calendar`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<CalendarEvent>(res);
  },

  update: async (id: number, payload: CalendarEventPayload): Promise<CalendarEvent> => {
    const res = await fetch(`${API_BASE}/calendar/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<CalendarEvent>(res);
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/calendar/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Грешка при изтриване.');
    }
  },
};
