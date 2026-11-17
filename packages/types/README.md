# @skillbridge/types

Shared TypeScript domain models and API contracts used by `apps/web`, `apps/api`
and the other workspaces.

```ts
import type { Job, Application } from "@skillbridge/types";
```

- `src/domain.ts` - entities mirroring the Prisma schema (jobs, candidates, interviews)
- `src/api.ts` - request/response envelopes such as `Paginated<T>` and `ApiError`

Types here are source-only; no build step is required inside the monorepo.
