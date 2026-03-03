package session

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

const CookieName = "skyimage_session"

type entry struct {
	userID    uint
	expiresAt time.Time
}

type Manager struct {
	mu       sync.RWMutex
	sessions map[string]entry
	ttl      time.Duration
}

func NewManager(ttl time.Duration) *Manager {
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return &Manager{
		sessions: make(map[string]entry),
		ttl:      ttl,
	}
}

func (m *Manager) Create(userID uint) (string, error) {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return "", err
	}
	id := hex.EncodeToString(token)

	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessions[id] = entry{
		userID:    userID,
		expiresAt: time.Now().Add(m.ttl),
	}
	return id, nil
}

func (m *Manager) Resolve(sessionID string) (uint, bool) {
	now := time.Now()

	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.sessions[sessionID]
	if !ok {
		return 0, false
	}
	if now.After(e.expiresAt) {
		delete(m.sessions, sessionID)
		return 0, false
	}

	// Sliding session window on every valid request.
	e.expiresAt = now.Add(m.ttl)
	m.sessions[sessionID] = e
	return e.userID, true
}

func (m *Manager) Delete(sessionID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.sessions, sessionID)
}

func (m *Manager) TTL() time.Duration {
	return m.ttl
}
