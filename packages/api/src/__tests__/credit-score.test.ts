// packages/api/src/__tests__/credit-score.test.ts
// Credit score simulator tests — ELT-12
// Key invariant: projected score must stay between 300 and 850

import { describe, it, expect } from "vitest";

// Inline simulator for tests
// TODO: Replace with import from tools/credit-score-simulator.ts when Dev 2 creates it

interface ScoreSimInput {
  currentScore: number;
  utilizationPlan: "low" | "moderate" | "high";
  onTimePayments: boolean;
  projectionMonths: number;
}

interface MonthProjection {
  month: number;
  scoreLow: number;
  scoreMid: number;
  scoreHigh: number;
}

const SCORE_MIN = 300;
const SCORE_MAX = 850;

function clampScore(score: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
}

function simulateCreditScore(input: ScoreSimInput): {
  currentScore: number;
  months: MonthProjection[];
  disclaimer: string;
} {
  const { currentScore, utilizationPlan, onTimePayments, projectionMonths } = input;

  // Monthly improvement factors (simplified FICO weights)
  const utilizationBonus = utilizationPlan === "low" ? 1.5 : utilizationPlan === "moderate" ? 0.7 : -0.5;
  const paymentBonus = onTimePayments ? 2.0 : -5.0;
  const newAccountPenalty = -8; // Initial hit for new account

  const months: MonthProjection[] = [];

  for (let m = 1; m <= projectionMonths; m++) {
    // Recovery from new account after 6 months
    const newAcctFactor = m <= 6 ? newAccountPenalty / 6 : 0;
    const monthlyDelta = paymentBonus + utilizationBonus + newAcctFactor;

    const cumulative = monthlyDelta * m;
    const mid = currentScore + cumulative;
    const low = mid - 15;
    const high = mid + 15;

    months.push({
      month: m,
      scoreLow: Math.round(clampScore(low)),
      scoreMid: Math.round(clampScore(mid)),
      scoreHigh: Math.round(clampScore(high)),
    });
  }

  return {
    currentScore,
    months,
    disclaimer:
      "This is an educational estimate based on FICO factor weights, not a guarantee of actual score changes. Many factors affect your credit score.",
  };
}

describe("Credit Score Simulator", () => {
  describe("Score bounds — CRITICAL invariant", () => {
    it("score never exceeds 850", () => {
      // Test with a near-perfect score + best behavior
      const result = simulateCreditScore({
        currentScore: 840,
        utilizationPlan: "low",
        onTimePayments: true,
        projectionMonths: 24,
      });
      result.months.forEach((m) => {
        expect(m.scoreLow).toBeLessThanOrEqual(SCORE_MAX);
        expect(m.scoreMid).toBeLessThanOrEqual(SCORE_MAX);
        expect(m.scoreHigh).toBeLessThanOrEqual(SCORE_MAX);
      });
    });

    it("score never drops below 300", () => {
      // Test with a low score + worst behavior
      const result = simulateCreditScore({
        currentScore: 320,
        utilizationPlan: "high",
        onTimePayments: false,
        projectionMonths: 24,
      });
      result.months.forEach((m) => {
        expect(m.scoreLow).toBeGreaterThanOrEqual(SCORE_MIN);
        expect(m.scoreMid).toBeGreaterThanOrEqual(SCORE_MIN);
        expect(m.scoreHigh).toBeGreaterThanOrEqual(SCORE_MIN);
      });
    });

    it("all scores valid for any starting value in 300-850 range", () => {
      const testScores = [300, 400, 500, 580, 620, 700, 800, 850];
      testScores.forEach((startScore) => {
        const result = simulateCreditScore({
          currentScore: startScore,
          utilizationPlan: "moderate",
          onTimePayments: true,
          projectionMonths: 12,
        });
        result.months.forEach((m) => {
          expect(m.scoreLow).toBeGreaterThanOrEqual(SCORE_MIN);
          expect(m.scoreHigh).toBeLessThanOrEqual(SCORE_MAX);
          expect(m.scoreLow).toBeLessThanOrEqual(m.scoreMid);
          expect(m.scoreMid).toBeLessThanOrEqual(m.scoreHigh);
        });
      });
    });
  });

  describe("Projection output", () => {
    it("12-month projection returns exactly 12 data points", () => {
      const result = simulateCreditScore({
        currentScore: 580,
        utilizationPlan: "low",
        onTimePayments: true,
        projectionMonths: 12,
      });
      expect(result.months).toHaveLength(12);
    });

    it("24-month projection returns exactly 24 data points", () => {
      const result = simulateCreditScore({
        currentScore: 580,
        utilizationPlan: "moderate",
        onTimePayments: true,
        projectionMonths: 24,
      });
      expect(result.months).toHaveLength(24);
    });

    it("months are numbered 1 through N", () => {
      const result = simulateCreditScore({
        currentScore: 600,
        utilizationPlan: "low",
        onTimePayments: true,
        projectionMonths: 6,
      });
      result.months.forEach((m, i) => {
        expect(m.month).toBe(i + 1);
      });
    });
  });

  describe("Score improvement logic", () => {
    it("on-time payments + low utilization → score improves over 12 months", () => {
      const result = simulateCreditScore({
        currentScore: 580,
        utilizationPlan: "low",
        onTimePayments: true,
        projectionMonths: 12,
      });
      const lastMonth = result.months[result.months.length - 1];
      // Mid score should be higher than starting score after 12 months
      expect(lastMonth).toBeDefined();
      expect(lastMonth!.scoreMid).toBeGreaterThan(580);
    });

    it("low utilization improves score more than high utilization", () => {
      const lowResult = simulateCreditScore({
        currentScore: 580,
        utilizationPlan: "low",
        onTimePayments: true,
        projectionMonths: 12,
      });
      const highResult = simulateCreditScore({
        currentScore: 580,
        utilizationPlan: "high",
        onTimePayments: true,
        projectionMonths: 12,
      });
      const lowFinalMid = lowResult.months[11]?.scoreMid ?? 0;
      const highFinalMid = highResult.months[11]?.scoreMid ?? 0;
      expect(lowFinalMid).toBeGreaterThan(highFinalMid);
    });
  });

  describe("Disclaimer", () => {
    it("always includes a disclaimer", () => {
      const result = simulateCreditScore({
        currentScore: 600,
        utilizationPlan: "moderate",
        onTimePayments: true,
        projectionMonths: 12,
      });
      expect(result.disclaimer).toBeTruthy();
      expect(result.disclaimer.toLowerCase()).toContain("estimate");
    });
  });
});
