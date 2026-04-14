import type Anthropic from "@anthropic-ai/sdk";
import { handleGetProductInfo } from "../tools/product-info.js";
import { calculateFinancialFitness } from "../tools/financial-calculator.js";
import { compareCards } from "../tools/comparison-engine.js";
import { simulateCreditScore } from "../tools/credit-score-simulator.js";
import { trackMilestoneProgress } from "../tools/milestone-tracker.js";

export interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

export async function executeTools(
  toolUseBlocks: Anthropic.ToolUseBlock[]
): Promise<ToolResult[]> {
  const results: ToolResult[] = [];

  for (const block of toolUseBlocks) {
    let result: unknown;

    try {
      result = await dispatchTool(block.name, block.input as Record<string, unknown>);
    } catch (err) {
      result = {
        error: err instanceof Error ? err.message : "Unknown tool error",
        tool: block.name,
      };
    }

    results.push({
      type: "tool_result",
      tool_use_id: block.id,
      content: JSON.stringify(result),
    });
  }

  return results;
}

async function dispatchTool(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_product_info":
      return handleGetProductInfo(input as unknown as Parameters<typeof handleGetProductInfo>[0]);

    case "calculate_financial_fitness":
      return calculateFinancialFitness({
        monthly_spending: input.monthly_spending as number,
        annual_fee: input.annual_fee as number | undefined,
        carries_balance: input.carries_balance as boolean | undefined,
        average_balance: input.average_balance as number | undefined,
        card_id: input.card_id as string | undefined,
      });

    case "compare_cards":
      return compareCards({
        brightway_card_id: input.brightway_card_id as string | undefined,
        competitor_card_ids: input.competitor_card_ids as string[] | undefined,
        focus_areas: input.focus_areas as string[] | undefined,
      });

    case "simulate_credit_score":
      return simulateCreditScore({
        currentScore: input.current_score as number,
        utilizationPlan: input.utilization_plan as "low" | "moderate" | "high" | undefined,
        onTimePayments: input.on_time_payments as boolean | undefined,
        projectionMonths: input.projection_months as number | undefined,
      });

    case "track_milestone_progress":
      return trackMilestoneProgress({
        startingApr: input.starting_apr as number | undefined,
        startingCreditLimit: input.starting_credit_limit as number | undefined,
        milestonesToShow: input.milestones_to_show as number | undefined,
        rewardPreference: input.reward_preference as
          | "apr_decrease"
          | "credit_limit_increase"
          | "alternating"
          | undefined,
      });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
