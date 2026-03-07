package api

import "strconv"

// parsePagination normalizes limit/offset query params to safe ranges.
func parsePagination(c queryReader, defaultLimit, maxLimit int) (int, int) {
	limit := defaultLimit
	if raw := c.Query("limit"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}
	if limit < 1 {
		limit = defaultLimit
	}
	if maxLimit > 0 && limit > maxLimit {
		limit = maxLimit
	}

	offset := 0
	if raw := c.Query("offset"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			offset = parsed
		}
	}
	if offset < 0 {
		offset = 0
	}
	return limit, offset
}

type queryReader interface {
	Query(string) string
}
