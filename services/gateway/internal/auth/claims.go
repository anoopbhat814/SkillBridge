package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims is the subset of the API's JWT payload that the gateway relies on.
type Claims struct {
	ID   string `json:"id"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

var ErrInvalidToken = errors.New("auth: invalid token")

// Parse validates a signed token and returns its claims.
func Parse(secret, raw string) (*Claims, error) {
	claims := &Claims{}
	tok, err := jwt.ParseWithClaims(raw, claims, func(*jwt.Token) (any, error) { return []byte(secret), nil })
	if err != nil || !tok.Valid || claims.ID == "" {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

// Sign issues a token; used by tests and local tooling.
func Sign(secret, id, role string, ttl time.Duration) (string, error) {
	c := Claims{ID: id, Role: role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl))}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString([]byte(secret))
}
