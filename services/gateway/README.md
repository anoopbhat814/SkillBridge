# SkillBridge Gateway

Go service that provides:

- `/ws` - authenticated WebSocket endpoint streaming conversation messages
- `/index/{kind}/{id}` and `/search` - in-memory full-text search index
- `/healthz` - liveness probe

Messages are published to Redis by the API and fanned out to connected clients by
conversation id (see `internal/hub`).

```bash
export REDIS_ADDR=localhost:6379 JWT_SECRET=dev-only-secret
go run ./cmd/gateway
go test ./...
```
