# Architecture

SkillBridge is a monorepo of cooperating services.

- **Web (Next.js)** renders candidate and employer experiences and talks to the API through a rewrite proxy.
- **API (Express + Prisma)** owns the PostgreSQL schema, authentication and business rules.
- **Matcher (FastAPI)** scores candidate/job pairs and parses resumes. The API falls back to a local overlap heuristic if it is unavailable.
- **Gateway (Go)** subscribes to Redis `conv:*` channels and fans messages out over WebSockets; it also hosts an in-memory inverted search index fed by the worker.
- **Worker (Node)** consumes the `sb:jobs` Redis list for email delivery and search reindexing with bounded retries.

Messages flow: API persists to Postgres, publishes to Redis, Gateway broadcasts to connected clients.
