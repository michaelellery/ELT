import type { MiddlewareHandler } from "hono";

const MAX_REQUESTS_PER_MINUTE = 20;
const WINDOW_MS = 60 * 1000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getRateLimitEntry(sessionId: string): RateLimitEntry | undefined {
  return rateLimitStore.get(sessionId);
}

export function resetRateLimit(sessionId: string): void {
  rateLimitStore.delete(sessionId);
}

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  let sessionId: string | undefined;

  // Clone the request body so downstream handlers can still read it
  try {
    const clonedBody = await c.req.text();
    const body = JSON.parse(clonedBody) as Record<string, unknown>;
    sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
    // Store for downstream reuse (avoids double-consume on streaming Lambda)
    c.set("parsedBody" as never, body);
    c.set("rawBody" as never, clonedBody);
  } catch {
    // No body or invalid JSON — let pass through to validation
  }

  if (!sessionId) {
    return next();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(sessionId);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    rateLimitStore.set(sessionId, { count: 1, windowStart: now });
    return next();
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS_PER_MINUTE) {
    const retryAfterSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    c.header("Retry-After", String(retryAfterSeconds));
    return c.json(
      {
        error: "rate_limit_exceeded",
        message: `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
        retryAfter: retryAfterSeconds,
      },
      429
    );
  }

  return next();
};
