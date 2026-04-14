// packages/api/src/__tests__/calculator.test.ts
// Financial calculator math tests — ELT-12
// These test the pure calculation logic (no Anthropic, no HTTP)

import { describe, it, expect } from "vitest";

// ---- Inline calculator for tests ----
// TODO: Replace with import from tools/financial-calculator.ts when Dev 2 creates it
// This mirrors the exact logic from the architecture doc

interface CalcInput {
  monthlySpending: number;
  annualFee: number;
  carriesBalance: boolean;
  averageBalance?: number;
  apr?: number; // defaults to 35.99
}

interface CalcResult {
  annualCashBack: number;
  annualFee: number;
  netBenefit: number;
  interestCost: number | undefined;
  trueNet: number | undefined;
  recommendation: "positive" | "cautious" | "negative";
  explanation: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calculateFinancialFitness(input: CalcInput): CalcResult {
  const cashBackRate = 0.01; // 1% for BrightWay standard
  const apr = input.apr ?? 35.99;

  const annualSpending = input.monthlySpending * 12;
  const annualCashBack = round2(annualSpending * cashBackRate);
  const annualFee = input.annualFee;
  const netBenefit = round2(annualCashBack - annualFee);

  let interestCost: number | undefined = undefined;
  let trueNet: number | undefined = undefined;

  if (input.carriesBalance && input.averageBalance !== undefined && input.averageBalance > 0) {
    interestCost = round2(input.averageBalance * (apr / 100));
    trueNet = round2(netBenefit - interestCost);
  }

  let recommendation: "positive" | "cautious" | "negative";
  const effectiveNet = trueNet !== undefined ? trueNet : netBenefit;

  if (effectiveNet > 0) {
    recommendation = "positive";
  } else if (effectiveNet >= -20) {
    recommendation = "cautious";
  } else {
    recommendation = "negative";
  }

  const explanation = `You'd earn $${annualCashBack}/year in cash back, pay $${annualFee}/year in fees, for a net benefit of $${netBenefit}.${
    interestCost
      ? ` However, carrying a balance costs approximately $${interestCost}/year in interest, reducing your true net to $${trueNet}.`
      : ""
  }`;

  return {
    annualCashBack,
    annualFee,
    netBenefit,
    interestCost,
    trueNet,
    recommendation,
    explanation,
  };
}
// ---- End inline calculator ----

describe("calculateFinancialFitness", () => {
  describe("Cash back calculation", () => {
    it("$500/mo spending → $60/year cash back at 1%", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 0,
        carriesBalance: false,
      });
      expect(result.annualCashBack).toBe(60); // 500 * 12 * 0.01
    });

    it("$0/mo spending → $0 cash back", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 0,
        annualFee: 0,
        carriesBalance: false,
      });
      expect(result.annualCashBack).toBe(0);
    });

    it("$1000/mo spending → $120/year cash back", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 1000,
        annualFee: 0,
        carriesBalance: false,
      });
      expect(result.annualCashBack).toBe(120);
    });
  });

  describe("Net benefit calculation", () => {
    it("$500/mo, $49 fee, no balance → $11 net (positive)", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: false,
      });
      expect(result.annualCashBack).toBe(60);
      expect(result.annualFee).toBe(49);
      expect(result.netBenefit).toBe(11);
      expect(result.recommendation).toBe("positive");
    });

    it("$100/mo, $89 fee, no balance → -$77 net (negative)", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 100,
        annualFee: 89,
        carriesBalance: false,
      });
      expect(result.annualCashBack).toBe(12);
      expect(result.netBenefit).toBe(-77);
      expect(result.recommendation).toBe("negative");
    });

    it("$400/mo, $49 fee, no balance → -$1 net (cautious)", () => {
      // $400 * 12 * 1% = $48; $48 - $49 = -$1
      const result = calculateFinancialFitness({
        monthlySpending: 400,
        annualFee: 49,
        carriesBalance: false,
      });
      expect(result.annualCashBack).toBe(48);
      expect(result.netBenefit).toBe(-1);
      expect(result.recommendation).toBe("cautious");
    });
  });

  describe("Balance carrying — interest cost", () => {
    it("carrying $300 balance at 35.99% APR → ~$107.97 interest/year", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: true,
        averageBalance: 300,
        apr: 35.99,
      });
      expect(result.interestCost).toBe(107.97); // 300 * 0.3599
      expect(result.trueNet).toBeDefined();
      expect(result.trueNet!).toBeLessThan(0);
      expect(result.recommendation).toBe("negative");
    });

    it("carrying $1000 balance at 35.99% APR → ~$359.90 interest/year", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: true,
        averageBalance: 1000,
        apr: 35.99,
      });
      expect(result.interestCost).toBe(359.9);
      expect(result.trueNet!).toBeLessThan(-200);
    });

    it("not carrying balance — no interestCost or trueNet", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: false,
      });
      expect(result.interestCost).toBeUndefined();
      expect(result.trueNet).toBeUndefined();
    });

    it("carries balance but averageBalance=0 → no interest cost", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: true,
        averageBalance: 0,
      });
      expect(result.interestCost).toBeUndefined();
    });
  });

  describe("Recommendation thresholds", () => {
    it("positive when trueNet > 0", () => {
      // Very high spending, no balance
      const result = calculateFinancialFitness({
        monthlySpending: 2000,
        annualFee: 0,
        carriesBalance: false,
      });
      expect(result.recommendation).toBe("positive");
    });

    it("cautious when effective net is between -20 and 0", () => {
      // $380/mo spending, $49 fee: cash back = $45.60, net = -$3.40
      const result = calculateFinancialFitness({
        monthlySpending: 380,
        annualFee: 49,
        carriesBalance: false,
      });
      expect(result.netBenefit).toBeGreaterThan(-20);
      expect(result.netBenefit).toBeLessThan(0);
      expect(result.recommendation).toBe("cautious");
    });

    it("negative when effective net < -20", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 50,
        annualFee: 89,
        carriesBalance: false,
      });
      expect(result.netBenefit).toBeLessThan(-20);
      expect(result.recommendation).toBe("negative");
    });
  });

  describe("Explanation text", () => {
    it("explanation includes cash back amount", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: false,
      });
      expect(result.explanation).toContain("$60");
    });

    it("explanation includes interest cost when carrying balance", () => {
      const result = calculateFinancialFitness({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: true,
        averageBalance: 300,
      });
      expect(result.explanation).toContain("interest");
    });
  });
});
