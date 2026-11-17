import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { lazyConnect: true });

export interface QueuedJob {
  type: "email" | "reindex" | "expire-jobs";
  payload: Record<string, unknown>;
}

/** Pushes a background job for the worker (apps/worker) to pick up. */
export async function enqueue(job: QueuedJob): Promise<void> {
  await redis.lpush("sb:jobs", JSON.stringify(job));
}
