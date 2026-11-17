package config

import (
	"errors"
	"strings"
)

// Validate reports configuration that is unsafe to run with.
func (c Config) Validate(production bool) error {
	if c.Addr == "" {
		return errors.New("config: GATEWAY_ADDR must not be empty")
	}
	if production && (c.JWTSecret == "dev-only-secret" || len(c.JWTSecret) < 32) {
		return errors.New("config: JWT_SECRET must be at least 32 characters in production")
	}
	if !strings.Contains(c.RedisAddr, ":") {
		return errors.New("config: REDIS_ADDR must be host:port")
	}
	return nil
}
