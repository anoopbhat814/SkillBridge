.PHONY: dev build test lint up down migrate seed matcher-test gateway-test

dev:
	npm run dev

build:
	npm run build

test: matcher-test gateway-test
	npm test

lint:
	npm run lint

up:
	docker compose -f deploy/docker-compose.yml up --build -d

down:
	docker compose -f deploy/docker-compose.yml down

migrate:
	npx prisma migrate deploy

seed:
	npm run db:seed

matcher-test:
	cd services/matcher && python -m pytest -q

gateway-test:
	cd services/gateway && go test ./...
