export const config = {
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  queue: "sb:jobs",
  deadLetterQueue: "sb:jobs:dead",
  maxAttempts: Number(process.env.WORKER_MAX_ATTEMPTS ?? 5),
};
