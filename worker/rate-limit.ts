/**
 * A sliding-window limiter, one bucket per key (the visitor's IP).
 *
 * Kept in the memory of one Worker isolate: it stops a visitor hammering the
 * endpoint, but two isolates count separately, so it is a floor and not a wall.
 * The wall belongs in Cloudflare (a rate-limiting rule on `/api/assistant`,
 * TODO.md Phase 8B). Pure and clock-injected so the tests need no timers.
 */

export interface Limit {
  /** Requests allowed inside `windowMs`. */
  max: number;
  windowMs: number;
}

export type Decision = { allowed: true } | { allowed: false; retryAfter: number };

/** Two windows at once: a short burst limit and a longer one. */
export const LIMITS: readonly Limit[] = [
  { max: 5, windowMs: 60_000 },
  { max: 30, windowMs: 3_600_000 },
];

/** Beyond this many distinct keys the oldest are forgotten, so the map cannot grow without bound. */
const MAX_KEYS = 5000;

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly limits: readonly Limit[];

  constructor(limits: readonly Limit[] = LIMITS) {
    this.limits = limits;
  }

  /** Records a request and says whether it may go on. A refused request is not recorded. */
  check(key: string, now: number): Decision {
    const longest = Math.max(...this.limits.map((limit) => limit.windowMs));
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < longest);

    for (const limit of this.limits) {
      const inside = recent.filter((time) => now - time < limit.windowMs);
      if (inside.length >= limit.max) {
        // The oldest hit in the window leaves it first; that is when a slot frees.
        const oldest = inside[0] ?? now;
        return { allowed: false, retryAfter: Math.max(1, Math.ceil((oldest + limit.windowMs - now) / 1000)) };
      }
    }

    recent.push(now);
    this.hits.delete(key); // re-insert, so Map order is least recently used first
    this.hits.set(key, recent);
    if (this.hits.size > MAX_KEYS) {
      const first = this.hits.keys().next();
      if (!first.done) this.hits.delete(first.value);
    }
    return { allowed: true };
  }
}
