// packages/api/src/__tests__/rate-limit.test.ts
// Rate limiting tests — ELT-12
// Spec: 20 requests/minute per sessionId

import { describe, it, expect, beforeEach, vi } from "vitest";

// Inline rate limiter for tests
// TODO: Replace with import from middleware/rate-limit.ts when Dev 2 creates it

const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000; // 1 minute

interface RateLimitState {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

function checkRateLimit(sessionId: string, nowMs: number = Date.now()): {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
} {
  const state = rateLimitStore.get(sessionId);

  if (!state || nowMs - state.windowStart > WINDOW_MS) {
    // New window
    rateLimitStore.set(sessionId, { count: 1, windowStart: nowMs });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (state.count >= RATE_LIMIT) {
    const retryAfterMs = WINDOW_MS - (nowMs - state.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  state.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - state.count };
}

describe("Rate Limiter", () => {
  const SESSION_A = "session-a-" + Date.now();
  const SESSION_B = "session-b-" + Date.now();

  beforeEach(() => {
    rateLimitStore.clear();
  });

  describe("Basic rate limiting", () => {
    it("allows first request", () => {
      const result = checkRateLimit(SESSION_A, 0);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19);
    });

    it("allows up to 20 requests in a window", () => {
      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(SESSION_A, i * 100); // 100ms apart
        expect(result.allowed).toBe(true);
      }
    });

    it("blocks the 21st request in a window", () => {
      for (let i = 0; i < 20; i++) {
        checkRateLimit(SESSION_A, 0); // All at same time
      }
      const result = checkRateLimit(SESSION_A, 100); // Still within window
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("returns retryAfterMs when blocked", () => {
      for (let i = 0; i < 20; i++) {
        checkRateLimit(SESSION_A, 0);
      }
      const result = checkRateLimit(SESSION_A, 30000); // 30 seconds in
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeDefined();
      expect(result.retryAfterMs!).toBeGreaterThan(0);
    });
  });

  describe("Window reset", () => {
    it("resets after window expires (60+ seconds)", () => {
      for (let i = 0; i < 20; i++) {
        checkRateLimit(SESSION_A, 0);
      }

      // Blocked during window
      const blocked = checkRateLimit(SESSION_A, 30000);
      expect(blocked.allowed).toBe(false);

      // Allowed after window expires
      const newWindow = checkRateLimit(SESSION_A, WINDOW_MS + 1);
      expect(newWindow.allowed).toBe(true);
    });

    it("new window starts fresh with 20 requests", () => {
      for (let i = 0; i < 20; i++) {
        checkRateLimit(SESSION_A, 0);
      }

      // New window
      const result = checkRateLimit(SESSION_A, WINDOW_MS + 1);
      expect(result.remaining).toBe(RATE_LIMIT - 1);
    });
  });

  describe("Per-session isolation", () => {
    it("sessions are rate-limited independently", () => {
      for (let i = 0; i < 20; i++) {
        checkRateLimit(SESSION_A, 0);
      }

      // SESSION_A is blocked
      const blockedA = checkRateLimit(SESSION_A, 0);
      expect(blockedA.allowed).toBe(false);

      // SESSION_B is not affected
      const allowedB = checkRateLimit(SESSION_B, 0);
      expect(allowedB.allowed).toBe(true);
    });

    it("different sessions have independent counters", () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(SESSION_A, 0);
        checkRateLimit(SESSION_B, 0);
      }

      const resultA = checkRateLimit(SESSION_A, 0);
      const resultB = checkRateLimit(SESSION_B, 0);
      expect(resultA.allowed).toBe(true); // 11/20
      expect(resultB.allowed).toBe(true); // 11/20
    });
  });

  describe("Rate limit spec compliance", () => {
    it("limit is set to 20 requests per minute", () => {
      expect(RATE_LIMIT).toBe(20);
    });

    it("window is 60 seconds", () => {
      expect(WINDOW_MS).toBe(60000);
    });
  });
});
