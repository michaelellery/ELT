import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { streamChatResponse } from "../services/anthropic.js";
import { containsPii } from "../middleware/pii-filter.js";

const chatRouter = new Hono();

const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z
    .string()
    .min(1, "message cannot be empty")
    .max(2000, "message cannot exceed 2000 characters"),
});

chatRouter.post("/chat", async (c) => {
  let body: unknown;
  try {
    // Prefer pre-parsed body from rate limiter middleware (avoids double-consume on Lambda streaming)
    body = c.get("parsedBody" as never) ?? (await c.req.json());
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const result = chatRequestSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "validation_error", details: result.error.errors },
      400
    );
  }

  const { sessionId, message } = result.data;

  // PII check
  if (containsPii(message)) {
    return c.json(
      {
        error: "pii_detected",
        message:
          "⚠️ Please don't share sensitive personal information (like SSNs or credit card numbers) in this chat. What would you like to know about BrightWay?",
      },
      400
    );
  }

  return streamSSE(c, async (stream) => {
    try {
      for await (const event of streamChatResponse(sessionId, message)) {
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
        });
      }
    } catch (err) {
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({
          type: "error",
          message: err instanceof Error ? err.message : "Stream error",
        }),
      });
    }
  });
});

export default chatRouter;
