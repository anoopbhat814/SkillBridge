import Redis from "ioredis";
import { handleEmail } from "./jobs/email.js";
import { handleReindex } from "./jobs/reindex.js";
import { handleExpireJobs } from "./jobs/expireJobs.js";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
const HANDLERS = { email: handleEmail, reindex: handleReindex, "expire-jobs": handleExpireJobs };

async function loop() {
  console.log("worker started");
  for (;;) {
    const [, raw] = (await redis.brpop("sb:jobs", 0)) ?? [];
    if (!raw) continue;
    const job = JSON.parse(raw);
    const handler = HANDLERS[job.type];
    if (!handler) {
      console.warn("unknown job type", job.type);
      continue;
    }
    try {
      await handler(job.payload);
    } catch (err) {
      const attempts = (job.attempts ?? 0) + 1;
      console.error(`job ${job.type} failed (attempt ${attempts})`, err);
      if (attempts < 5) await redis.lpush("sb:jobs", JSON.stringify({ ...job, attempts }));
      else await redis.lpush("sb:jobs:dead", raw);
    }
  }
}

loop();
