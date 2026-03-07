package data

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

const apiTokenPrefix = "sk_"

// GenerateAPIToken creates a random API token that is shown to user once.
func GenerateAPIToken() (string, error) {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return "", err
	}
	return apiTokenPrefix + hex.EncodeToString(token), nil
}

// HashAPIToken returns a deterministic hash used for database storage.
func HashAPIToken(token string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(token)))
	return hex.EncodeToString(sum[:])
}

// IsLegacyPlainAPIToken returns true for old plain-text token format.
func IsLegacyPlainAPIToken(stored string) bool {
	return strings.Contains(strings.TrimSpace(stored), "|")
}
