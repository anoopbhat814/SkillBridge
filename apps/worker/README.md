# @skillbridge/worker

Background job runner. Jobs are JSON documents pushed onto the Redis list `sb:jobs`
by the API; the worker pops them with `BRPOP` and dispatches by `type`.

| Type | Handler | Purpose |
|------|---------|---------|
| `email` | `src/jobs/email.js` | Transactional email via SMTP |
| `reindex` | `src/jobs/reindex.js` | Push documents to the gateway search index |
| `expire-jobs` | `src/jobs/expireJobs.js` | Close postings past their expiry date |

Failed jobs are retried up to five times, then moved to `sb:jobs:dead`.

```bash
REDIS_URL=redis://localhost:6379 npm run start -w @skillbridge/worker
```
