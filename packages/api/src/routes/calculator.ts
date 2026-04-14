import { Hono } from "hono";
import { z } from "zod";
import { calculateFinancialFitness } from "../tools/financial-calculator.js";

const calculatorRouter = new Hono();

const calcSchema = z.object({
  monthlySpending: z.number().min(0).max(100000),
  annualFee: z.number().min(0).max(200).optional(),
  carriesBalance: z.boolean().optional().default(false),
  averageBalance: z.number().min(0).optional(),
  cardId: z.string().optional(),
});

calculatorRouter.post("/calculator", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const result = calcSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "validation_error", details: result.error.errors },
      400
    );
  }

  const calcResult = calculateFinancialFitness({
    monthly_spending: result.data.monthlySpending,
    annual_fee: result.data.annualFee,
    carries_balance: result.data.carriesBalance,
    average_balance: result.data.averageBalance,
    card_id: result.data.cardId,
  });

  return c.json(calcResult);
});

export default calculatorRouter;
