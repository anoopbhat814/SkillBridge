package config

import "testing"

func TestLoadDefaults(t *testing.T) {
	t.Setenv("GATEWAY_ADDR", "")
	t.Setenv("REDIS_ADDR", "")
	cfg := Load()
	if cfg.Addr != ":8080" || cfg.RedisAddr != "localhost:6379" {
		t.Fatalf("unexpected defaults: %+v", cfg)
	}
}

func TestLoadOverrides(t *testing.T) {
	t.Setenv("GATEWAY_ADDR", ":9000")
	if got := Load().Addr; got != ":9000" {
		t.Fatalf("expected :9000, got %s", got)
	}
}

func TestValidateRejectsWeakSecretInProduction(t *testing.T) {
	cfg := Config{Addr: ":8080", RedisAddr: "redis:6379", JWTSecret: "dev-only-secret"}
	if err := cfg.Validate(true); err == nil {
		t.Fatal("expected error for weak secret")
	}
	if err := cfg.Validate(false); err != nil {
		t.Fatalf("unexpected error outside production: %v", err)
	}
}
