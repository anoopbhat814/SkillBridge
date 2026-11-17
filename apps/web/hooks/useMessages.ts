import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
}

/** Subscribes to the Go gateway over WebSocket with exponential-backoff reconnects. */
export function useConversationStream(conversationId: string, token: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const retry = useRef(0);

  useEffect(() => {
    if (!token) return;
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(`${process.env.NEXT_PUBLIC_GATEWAY_WS}/ws?conversation=${conversationId}&token=${token}`);
      socket.onopen = () => (retry.current = 0);
      socket.onmessage = (ev) => setMessages((prev) => [...prev, JSON.parse(ev.data) as ChatMessage]);
      socket.onclose = () => {
        if (closed) return;
        timer = setTimeout(connect, Math.min(30_000, 500 * 2 ** retry.current++));
      };
    };
    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [conversationId, token]);

  return messages;
}
