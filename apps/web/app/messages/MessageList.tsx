import type { ChatMessage } from "../../hooks/useMessages";

export function MessageList({ messages, currentUserId }: { messages: ChatMessage[]; currentUserId?: string }) {
  if (messages.length === 0) return <p>No messages yet. Say hello!</p>;
  return (
    <ul>
      {messages.map((m) => (
        <li key={m.id} data-mine={m.senderId === currentUserId}>
          <span>{m.body}</span>
          <time dateTime={m.sentAt}>{new Date(m.sentAt).toLocaleTimeString()}</time>
        </li>
      ))}
    </ul>
  );
}
