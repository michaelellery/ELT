import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "get_product_info",
    description:
      "Retrieve detailed information about a BrightWay card or competitor card. Use this for ANY question about rates, fees, limits, or features. Never guess card details — always use this tool.",
    input_schema: {
      type: "object" as const,
      properties: {
        card_id: {
          type: "string",
          description:
            "Card identifier. Use 'brightway-standard', 'brightway-cashback', 'brightway-plus', or a competitor ID like 'capital-one-platinum-secured', 'indigo-platinum', 'destiny-mastercard', 'credit-one-platinum-visa', 'surge-platinum-mastercard', 'aspire-cashback-rewards', 'revvi-visa', 'opensky-secured-visa'.",
        },
        fields: {
          type: "array",
          items: { type: "string" },
          description:
            "Specific fields to retrieve: 'apr', 'fees', 'cashback', 'credit_limit', 'milestones', 'features', 'all'. Defaults to 'all'.",
        },
      },
      required: ["card_id"],
    },
  },
  {
    name: "calculate_financial_fitness",
    description:
      "Calculate whether the BrightWay card makes financial sense for a user based on their spending habits. Returns cash back earnings, fee impact, interest cost if carrying a balance, and a recommendation.",
    input_schema: {
      type: "object" as const,
      properties: {
        monthly_spending: {
          type: "number",
          description: "User's estimated monthly card spending in dollars.",
        },
        annual_fee: {
          type: "number",
          description: "The annual fee tier ($0, $49, $75, or $89). Default $49 if unknown.",
        },
        carries_balance: {
          type: "boolean",
          description: "Whether the user typically carries a balance month-to-month.",
        },
        average_balance: {
          type: "number",
          description: "If carries_balance is true, the average monthly balance carried.",
        },
        card_id: {
          type: "string",
          description: "Which BrightWay card to calculate for. Default: 'brightway-standard'.",
        },
      },
      required: ["monthly_spending"],
    },
  },
  {
    name: "compare_cards",
    description:
      "Compare BrightWay to one or more competitor cards across key dimensions. Returns a structured comparison with wins/losses for each dimension.",
    input_schema: {
      type: "object" as const,
      properties: {
        brightway_card_id: {
          type: "string",
          description: "BrightWay card to compare. Default: 'brightway-standard'.",
        },
        competitor_card_ids: {
          type: "array",
          items: { type: "string" },
          description:
            "Competitor card IDs to compare against. If empty, compares to all major competitors.",
        },
        focus_areas: {
          type: "array",
          items: { type: "string" },
          description:
            "Specific areas to focus on: 'apr', 'fees', 'rewards', 'credit_limit', 'graduation', 'all'. Default: 'all'.",
        },
      },
      required: [],
    },
  },
  {
    name: "simulate_credit_score",
    description:
      "Estimate potential credit score improvement from responsible BrightWay card usage over time. Based on FICO factor weights. This is educational only, not a guarantee.",
    input_schema: {
      type: "object" as const,
      properties: {
        current_score: {
          type: "number",
          description: "User's current credit score (300-850).",
        },
        utilization_plan: {
          type: "string",
          enum: ["low", "moderate", "high"],
          description:
            "Planned credit utilization: low (<10%), moderate (10-30%), high (>30%).",
        },
        on_time_payments: {
          type: "boolean",
          description: "Whether user commits to 100% on-time payments. Default true.",
        },
        projection_months: {
          type: "number",
          description: "How many months to project. Default: 12.",
        },
      },
      required: ["current_score"],
    },
  },
  {
    name: "track_milestone_progress",
    description:
      "Show what the BrightWay Milestone journey looks like over time. Illustrates payment-by-payment progress toward APR reductions and credit limit increases.",
    input_schema: {
      type: "object" as const,
      properties: {
        starting_apr: {
          type: "number",
          description: "Starting APR. Default: 35.99.",
        },
        starting_credit_limit: {
          type: "number",
          description: "Starting credit limit. Default: 1000.",
        },
        milestones_to_show: {
          type: "number",
          description: "Number of milestones to project (1-8). Default: 4.",
        },
        reward_preference: {
          type: "string",
          enum: ["apr_decrease", "credit_limit_increase", "alternating"],
          description:
            "Which reward to choose at each milestone. Default: 'alternating'.",
        },
      },
      required: [],
    },
  },
];
