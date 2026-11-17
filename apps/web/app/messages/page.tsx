"use client";
import { useState } from "react";
import { useConversationStream } from "../../hooks/useMessages";
import { api } from "../../lib/api";

export default function MessagesPage() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sb_token") : null;
  const conversationId = "demo";
  const messages = useConversationStream(conversationId, token);
  const [draft, setDraft] = useState("");

  async function send() {
    if (!draft.trim()) return;
    await api(`/messages/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body: draft }),
    });
    setDraft("");
  }

  return (
    <main>
      <h1>Messages</h1>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>{m.body}</li>
        ))}
      </ul>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
      <button onClick={send}>Send</button>
    </main>
  );
}
