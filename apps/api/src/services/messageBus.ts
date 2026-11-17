import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

export interface BusMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: Date;
}

/** Publishes to the channel the Go gateway subscribes to for WebSocket fan-out. */
export async function publishMessage(msg: BusMessage): Promise<void> {
  await redis.publish(`conv:${msg.conversationId}`, JSON.stringify(msg));
}
