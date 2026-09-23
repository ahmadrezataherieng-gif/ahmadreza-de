-- The anonymous public counters (Phase 9C, DECISIONS.md 56).
-- A counter name and an integer. Nothing about who counted, or when.
CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  n INTEGER NOT NULL DEFAULT 0
);
