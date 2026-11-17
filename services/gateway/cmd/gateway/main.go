package main

import (
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/skillbridge/gateway/internal/auth"
	"github.com/skillbridge/gateway/internal/config"
	"github.com/skillbridge/gateway/internal/hub"
	"github.com/skillbridge/gateway/internal/search"
)

func main() {
	cfg := config.Load()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr})
	h := hub.New()
	go h.SubscribeRedis(ctx, rdb)

	idx := search.NewIndex()
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", auth.Middleware(cfg.JWTSecret, h.ServeWS))
	mux.HandleFunc("/index/", idx.HandleIndex)
	mux.HandleFunc("/search", idx.HandleSearch)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte(`{"ok":true}`)) })

	srv := &http.Server{Addr: cfg.Addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		srv.Shutdown(shutdown)
	}()

	log.Printf("gateway listening on %s", cfg.Addr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
