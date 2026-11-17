package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestMiddlewareAcceptsBearerToken(t *testing.T) {
	tok, err := Sign("s3cret", "user-1", "CANDIDATE", time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	var got string
	h := Middleware("s3cret", func(w http.ResponseWriter, r *http.Request) { got = UserID(r.Context()) })

	req := httptest.NewRequest(http.MethodGet, "/ws", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	h(httptest.NewRecorder(), req)

	if got != "user-1" {
		t.Fatalf("expected user-1, got %q", got)
	}
}

func TestMiddlewareAcceptsQueryToken(t *testing.T) {
	tok, _ := Sign("s3cret", "user-2", "EMPLOYER", time.Minute)
	rec := httptest.NewRecorder()
	h := Middleware("s3cret", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusNoContent) })
	h(rec, httptest.NewRequest(http.MethodGet, "/ws?token="+tok, nil))
	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", rec.Code)
	}
}

func TestMiddlewareRejectsBadToken(t *testing.T) {
	rec := httptest.NewRecorder()
	h := Middleware("s3cret", func(http.ResponseWriter, *http.Request) { t.Fatal("handler should not run") })
	h(rec, httptest.NewRequest(http.MethodGet, "/ws?token=garbage", nil))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}
