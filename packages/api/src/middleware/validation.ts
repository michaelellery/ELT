import { z } from "zod";
import type { MiddlewareHandler } from "hono";

export const chatRequestSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
  message: z
    .string()
    .min(1, "message cannot be empty")
    .max(2000, "message cannot exceed 2000 characters"),
});

export const calcRequestSchema = z.object({
  monthlySpending: z.number().min(0).max(100000),
  annualFee: z.number().optional(),
  carriesBalance: z.boolean().optional(),
  averageBalance: z.number().min(0).optional(),
  cardId: z.string().optional(),
});

export const compareRequestSchema = z.object({
  brightwayCardId: z.string().optional(),
  competitorIds: z.array(z.string()).optional(),
  focusAreas: z.array(z.string()).optional(),
});

export function validateChatRequest(): MiddlewareHandler {
  return async (c, next) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const result = chatRequestSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        {
          error: "validation_error",
          details: result.error.errors,
        },
        400
      );
    }

    c.set("validatedBody" as never, result.data);
    return next();
  };
}
