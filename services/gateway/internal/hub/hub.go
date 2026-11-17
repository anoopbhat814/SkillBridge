package hub

import (
	"context"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(*http.Request) bool { return true }}

// Hub fans out messages published to Redis to WebSocket clients by conversation.
type Hub struct {
	mu      sync.RWMutex
	clients map[string]map[*Client]struct{}
}

func New() *Hub {
	return &Hub{clients: make(map[string]map[*Client]struct{})}
}

func (h *Hub) add(conv string, c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[conv] == nil {
		h.clients[conv] = make(map[*Client]struct{})
	}
	h.clients[conv][c] = struct{}{}
}

func (h *Hub) remove(conv string, c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients[conv], c)
	if len(h.clients[conv]) == 0 {
		delete(h.clients, conv)
	}
}

// Broadcast delivers a payload to every client subscribed to conv.
func (h *Hub) Broadcast(conv string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for c := range h.clients[conv] {
		select {
		case c.send <- payload:
		default: // slow consumer: drop rather than block the hub
		}
	}
}

// SubscribeRedis listens on conv:* channels published by the API.
func (h *Hub) SubscribeRedis(ctx context.Context, rdb *redis.Client) {
	sub := rdb.PSubscribe(ctx, "conv:*")
	defer sub.Close()
	for msg := range sub.Channel() {
		h.Broadcast(strings.TrimPrefix(msg.Channel, "conv:"), []byte(msg.Payload))
	}
}

// ServeWS upgrades the connection and registers the client.
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conv := r.URL.Query().Get("conversation")
	if conv == "" {
		http.Error(w, "conversation required", http.StatusBadRequest)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade: %v", err)
		return
	}
	c := newClient(conn)
	h.add(conv, c)
	go c.writePump()
	c.readPump()
	h.remove(conv, c)
}
