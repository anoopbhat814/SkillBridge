# Contributing to SkillBridge

Thanks for taking the time to contribute. This guide covers the local workflow
and the conventions we follow across the monorepo.

## Prerequisites

- Node.js 20+ and npm 10+
- Go 1.22+
- Python 3.12+
- Docker (for PostgreSQL and Redis)

## Local setup

```bash
cp .env.example .env
npm install
docker compose -f deploy/docker-compose.yml up -d postgres redis
make migrate seed
make dev
```

The Python matcher and Go gateway are started separately; see
`services/matcher/README.md` and `services/gateway/README.md`.

## Branching and commits

- Branch from `main` using `feat/`, `fix/`, `docs/` or `chore/` prefixes.
- Write commit messages in the imperative mood and follow
  [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat(api): add interview reschedule endpoint`).
- Keep pull requests focused. Large refactors should be split from behaviour changes.

## Code style

- TypeScript and JavaScript are formatted with Prettier and linted with ESLint
  (`npm run format`, `npm run lint`).
- Python follows PEP 8 with type hints on public functions.
- Go code must pass `gofmt` and `go vet`.

## Tests

| Area | Command |
|------|---------|
| API, web, shared packages | `npm test` |
| Matcher | `make matcher-test` |
| Gateway | `make gateway-test` |

New features need tests. Bug fixes should include a regression test.

## Database changes

1. Edit `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <short_description>`.
3. Commit the generated folder under `prisma/migrations/`.

Never edit a migration that has already been merged to `main`.

## Pull request checklist

- [ ] Tests added or updated
- [ ] `npm run lint` and `make test` pass
- [ ] Docs updated where behaviour changed
- [ ] `CHANGELOG.md` entry added under "Unreleased"

## Reporting security issues

Please do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).
