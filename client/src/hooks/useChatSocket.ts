import { useCallback, useEffect, useRef, useState } from 'react';

import {
  chatSocketUrl,
  fetchHistory,
  type ChatAuthor,
  type ChatEvent,
  type ChatMessage,
} from '../services/chatApi';

export type ChatStatus = 'connecting' | 'online' | 'offline';

const RECONNECT_DELAY_MS = 2000;

interface UseChatSocket {
  messages: ChatMessage[];
  online: ChatAuthor[];
  status: ChatStatus;
  error: string | null;
  send: (content: string) => boolean;
}

/** Keeps a single group-chat socket alive, seeded with the persisted history. */
export function useChatSocket(): UseChatSocket {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState<ChatAuthor[]>([]);
  const [status, setStatus] = useState<ChatStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    fetchHistory()
      .then((history) => {
        if (!disposed) setMessages(history);
      })
      .catch((err: unknown) => {
        if (!disposed) setError(err instanceof Error ? err.message : 'Грешка при зареждане.');
      });

    const connect = (): void => {
      if (disposed) return;
      setStatus('connecting');

      const socket = new WebSocket(chatSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => !disposed && setStatus('online');

      socket.onmessage = (event: MessageEvent<string>) => {
        const parsed = JSON.parse(event.data) as ChatEvent;
        if (parsed.type === 'message') {
          // The server echoes our own messages too, so every client appends the same way.
          setMessages((prev) =>
            prev.some((m) => m.id === parsed.data.id) ? prev : [...prev, parsed.data],
          );
        } else if (parsed.type === 'presence') {
          setOnline(parsed.data.users);
        } else if (parsed.type === 'error') {
          setError(parsed.data.detail);
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        setStatus('offline');
        retryTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((content: string): boolean => {
    const socket = socketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ content }));
    return true;
  }, []);

  return { messages, online, status, error, send };
}
