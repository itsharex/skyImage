package api

import (
	"sync"
	"time"
)

type requestLimiter struct {
	mu      sync.Mutex
	buckets map[string]*limitBucket
}

type limitBucket struct {
	count   int
	resetAt time.Time
}

func newRequestLimiter() *requestLimiter {
	return &requestLimiter{
		buckets: make(map[string]*limitBucket),
	}
}

func (l *requestLimiter) Allow(key string, limit int, window time.Duration) (bool, time.Duration) {
	if l == nil || limit <= 0 || window <= 0 || key == "" {
		return true, 0
	}

	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()

	for k, bucket := range l.buckets {
		if now.After(bucket.resetAt) {
			delete(l.buckets, k)
		}
	}

	bucket, ok := l.buckets[key]
	if !ok || now.After(bucket.resetAt) {
		l.buckets[key] = &limitBucket{
			count:   1,
			resetAt: now.Add(window),
		}
		return true, 0
	}

	if bucket.count >= limit {
		return false, time.Until(bucket.resetAt)
	}

	bucket.count++
	return true, 0
}
