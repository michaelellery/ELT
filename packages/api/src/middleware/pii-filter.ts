import type { MiddlewareHandler } from "hono";

// Patterns that indicate PII
const SSN_PATTERN = /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/;
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/;
const EIN_PATTERN = /\b\d{2}-\d{7}\b/;

const PII_PATTERNS = [SSN_PATTERN, CREDIT_CARD_PATTERN, EIN_PATTERN];

export function containsPii(text: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(text));
}

export const piiFilter: MiddlewareHandler = async (c, next) => {
  // Only filter POST requests with JSON bodies
  if (c.req.method !== "POST") {
    return next();
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return next();
  }

  const message = typeof body.message === "string" ? body.message : "";

  if (containsPii(message)) {
    return c.json(
      {
        error: "pii_detected",
        message:
          "⚠️ Please don't share sensitive personal information (like SSNs or credit card numbers) in this chat. I'm here to help with card questions, not handle sensitive data. What would you like to know about BrightWay?",
      },
      400
    );
  }

  // Re-attach body for downstream handlers
  // Store in context variable
  c.set("parsedBody" as never, body);

  return next();
};
