FROM golang:1.22-alpine AS build
WORKDIR /src
COPY services/gateway/go.mod services/gateway/go.sum* ./
RUN go mod download
COPY services/gateway .
RUN CGO_ENABLED=0 go build -o /out/gateway ./cmd/gateway

FROM gcr.io/distroless/static
COPY --from=build /out/gateway /gateway
EXPOSE 8080
ENTRYPOINT ["/gateway"]
