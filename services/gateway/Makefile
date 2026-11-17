.PHONY: build run test lint

build:
	go build -o bin/gateway ./cmd/gateway

run:
	go run ./cmd/gateway

test:
	go test -race ./...

lint:
	golangci-lint run ./...
