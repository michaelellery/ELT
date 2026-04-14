import { Hono } from "hono";
import { z } from "zod";
import { compareCards } from "../tools/comparison-engine.js";

const compareRouter = new Hono();

const compareSchema = z.object({
  brightwayCardId: z.string().optional(),
  competitorIds: z.array(z.string()).optional(),
  focusAreas: z.array(z.string()).optional(),
});

compareRouter.post("/compare", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const result = compareSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "validation_error", details: result.error.errors },
      400
    );
  }

  const compareResult = compareCards({
    brightway_card_id: result.data.brightwayCardId,
    competitor_card_ids: result.data.competitorIds,
    focus_areas: result.data.focusAreas,
  });

  return c.json(compareResult);
});

export default compareRouter;
