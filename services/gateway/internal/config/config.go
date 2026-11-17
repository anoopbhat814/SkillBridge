package config

import "os"

// Config holds runtime settings sourced from environment variables.
type Config struct {
	Addr      string
	RedisAddr string
	JWTSecret string
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// Load reads configuration from the environment with sensible local defaults.
func Load() Config {
	return Config{
		Addr:      getenv("GATEWAY_ADDR", ":8080"),
		RedisAddr: getenv("REDIS_ADDR", "localhost:6379"),
		JWTSecret: getenv("JWT_SECRET", "dev-only-secret"),
	}
}
