const API_BASE = 'http://localhost:5000/api';

export type EventType = 'success' | 'warning' | 'error' | 'default' | 'seminar';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // ISO string
  type: EventType;
  createdAt: string;
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
};
