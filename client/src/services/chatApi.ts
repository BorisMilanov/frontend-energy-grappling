import { API_BASE, getToken } from './authApi';

export interface ChatAuthor {
  id: number;
  full_name: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  created_at: string;
  author: ChatAuthor;
}

export interface PresencePayload {
  users: ChatAuthor[];
  count: number;
}

export type ChatEvent =
  | { type: 'message'; data: ChatMessage }
  | { type: 'presence'; data: PresencePayload }
  | { type: 'error'; data: { detail: string } };

export const MAX_MESSAGE_LENGTH = 2000;

export async function fetchHistory(limit = 50): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/chat/messages?limit=${limit}`, {
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (!res.ok) throw new Error('Историята на чата не можа да се зареди.');
  return (await res.json()) as ChatMessage[];
}

/** ws(s):// URL for the group chat, with the JWT as a query param. */
export function chatSocketUrl(): string {
  const httpUrl = new URL(`${API_BASE}/chat/ws`);
  httpUrl.protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  httpUrl.searchParams.set('token', getToken() ?? '');
  return httpUrl.toString();
}
