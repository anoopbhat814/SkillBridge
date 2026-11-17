package hub

import "testing"

func TestBroadcastDeliversToSubscribers(t *testing.T) {
	h := New()
	c := &Client{send: make(chan []byte, 1)}
	h.add("conv1", c)

	h.Broadcast("conv1", []byte("hello"))
	select {
	case got := <-c.send:
		if string(got) != "hello" {
			t.Fatalf("got %q", got)
		}
	default:
		t.Fatal("expected message")
	}

	h.remove("conv1", c)
	if len(h.clients) != 0 {
		t.Fatal("conversation not cleaned up")
	}
}
