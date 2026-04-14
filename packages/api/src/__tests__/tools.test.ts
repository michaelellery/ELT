import { describe, it, expect } from "vitest";
import { compareCards } from "../tools/comparison-engine.js";
import { simulateCreditScore } from "../tools/credit-score-simulator.js";
import { trackMilestoneProgress } from "../tools/milestone-tracker.js";
import { handleGetProductInfo } from "../tools/product-info.js";

// ============================================================
// Product Info Tool
// ============================================================
describe("handleGetProductInfo", () => {
  it("returns full card data for brightway-standard", () => {
    const result = handleGetProductInfo({ card_id: "brightway-standard" }) as Record<string, unknown>;
    expect(result).toBeDefined();
    expect((result as { id: string }).id).toBe("brightway-standard");
    expect((result as { name: string }).name).toBe("BrightWay");
  });

  it("returns error for unknown card ID", () => {
    const result = handleGetProductInfo({ card_id: "nonexistent-card" }) as { error: string };
    expect(result.error).toContain("Card not found");
  });

  it("returns only APR fields when fields=['apr']", () => {
    const result = handleGetProductInfo({
      card_id: "brightway-standard",
      fields: ["apr"],
    }) as { apr: { regular: number }; cashBack?: unknown };
    expect(result.apr).toBeDefined();
    expect(result.apr.regular).toBe(35.99);
    expect(result.cashBack).toBeUndefined();
  });

  it("returns all fields when fields=['all']", () => {
    const result = handleGetProductInfo({
      card_id: "brightway-standard",
      fields: ["all"],
    }) as { apr: unknown; cashBack: unknown; milestones: unknown };
    expect(result.apr).toBeDefined();
    expect(result.cashBack).toBeDefined();
    expect(result.milestones).toBeDefined();
  });
});

// ============================================================
// Comparison Engine
// ============================================================
describe("compareCards", () => {
  it("returns structured result with dimensions", () => {
    const result = compareCards({
      brightway_card_id: "brightway-standard",
      competitor_card_ids: ["capital-one-platinum-secured"],
    });
    expect(result.cards).toHaveLength(2);
    expect(result.dimensions.length).toBeGreaterThan(0);
    expect(result.verdict).toBeDefined();
    expect(typeof result.verdict).toBe("string");
  });

  it("BrightWay wins on cash back vs Capital One (no rewards)", () => {
    const result = compareCards({
      brightway_card_id: "brightway-standard",
      competitor_card_ids: ["capital-one-platinum-secured"],
      focus_areas: ["rewards"],
    });
    const cashBackDim = result.dimensions.find((d) => d.name === "Cash Back");
    expect(cashBackDim).toBeDefined();
    const bwEntry = cashBackDim!.cards.find((c) => c.cardId === "brightway-standard");
    const capOneEntry = cashBackDim!.cards.find(
      (c) => c.cardId === "capital-one-platinum-secured"
    );
    expect(bwEntry!.indicator).toBe("win");
    expect(capOneEntry!.indicator).toBe("loss");
  });

  it("Capital One wins on APR (28.99% vs 35.99%)", () => {
    const result = compareCards({
      brightway_card_id: "brightway-standard",
      competitor_card_ids: ["capital-one-platinum-secured"],
      focus_areas: ["apr"],
    });
    const aprDim = result.dimensions.find((d) => d.name === "Regular APR");
    expect(aprDim).toBeDefined();
    const bwEntry = aprDim!.cards.find((c) => c.cardId === "brightway-standard");
    expect(bwEntry!.indicator).toBe("loss");
  });

  it("returns error for unknown BrightWay card ID", () => {
    const result = compareCards({ brightway_card_id: "nonexistent-card" });
    expect(result.verdict).toContain("not found");
  });

  it("compares to default competitors when no IDs given", () => {
    const result = compareCards({});
    expect(result.cards.length).toBeGreaterThan(1);
    expect(result.dimensions.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Credit Score Simulator
// ============================================================
describe("simulateCreditScore", () => {
  it("returns 12 projections by default", () => {
    const result = simulateCreditScore({ currentScore: 580 });
    expect(result.projections).toHaveLength(12);
  });

  it("respects projectionMonths parameter", () => {
    const result = simulateCreditScore({
      currentScore: 600,
      projectionMonths: 6,
    });
    expect(result.projections).toHaveLength(6);
  });

  it("all scores stay within 300-850 range", () => {
    const result = simulateCreditScore({ currentScore: 580 });
    for (const p of result.projections) {
      expect(p.low).toBeGreaterThanOrEqual(300);
      expect(p.low).toBeLessThanOrEqual(850);
      expect(p.mid).toBeGreaterThanOrEqual(300);
      expect(p.mid).toBeLessThanOrEqual(850);
      expect(p.high).toBeGreaterThanOrEqual(300);
      expect(p.high).toBeLessThanOrEqual(850);
    }
  });

  it("near-perfect score (840) stays at or below 850", () => {
    const result = simulateCreditScore({
      currentScore: 840,
      utilizationPlan: "low",
    });
    for (const p of result.projections) {
      expect(p.high).toBeLessThanOrEqual(850);
    }
  });

  it("very low score (300) doesn't go below 300", () => {
    const result = simulateCreditScore({
      currentScore: 300,
    });
    for (const p of result.projections) {
      expect(p.low).toBeGreaterThanOrEqual(300);
    }
  });

  it("includes disclaimer", () => {
    const result = simulateCreditScore({ currentScore: 600 });
    expect(result.disclaimer).toBeDefined();
    expect(result.disclaimer.length).toBeGreaterThan(10);
  });

  it("includes key factors", () => {
    const result = simulateCreditScore({ currentScore: 580 });
    expect(result.keyFactors.length).toBeGreaterThan(0);
  });

  it("low utilization produces better mid score than high at month 12", () => {
    const lowUtil = simulateCreditScore({
      currentScore: 580,
      utilizationPlan: "low",
    });
    const highUtil = simulateCreditScore({
      currentScore: 580,
      utilizationPlan: "high",
    });
    const lastLow = lowUtil.projections[11]!;
    const lastHigh = highUtil.projections[11]!;
    expect(lastLow.mid).toBeGreaterThan(lastHigh.mid);
  });
});

// ============================================================
// Milestone Tracker
// ============================================================
describe("trackMilestoneProgress", () => {
  it("returns 4 milestones by default", () => {
    const result = trackMilestoneProgress({});
    expect(result.milestones).toHaveLength(4);
  });

  it("respects milestonesToShow parameter", () => {
    const result = trackMilestoneProgress({ milestonesToShow: 2 });
    expect(result.milestones).toHaveLength(2);
  });

  it("APR never goes below 19.99% floor", () => {
    const result = trackMilestoneProgress({
      startingApr: 35.99,
      milestonesToShow: 8,
      rewardPreference: "apr_decrease",
    });
    for (const milestone of result.milestones) {
      expect(milestone.apr).toBeGreaterThanOrEqual(19.99);
    }
  });

  it("credit limit never exceeds $15,000", () => {
    const result = trackMilestoneProgress({
      startingCreditLimit: 12000,
      milestonesToShow: 8,
      rewardPreference: "credit_limit_increase",
    });
    for (const milestone of result.milestones) {
      expect(milestone.creditLimit).toBeLessThanOrEqual(15000);
    }
  });

  it("milestone payment numbers are correct (multiples of 6)", () => {
    const result = trackMilestoneProgress({ milestonesToShow: 4 });
    expect(result.milestones[0]!.paymentNumber).toBe(6);
    expect(result.milestones[1]!.paymentNumber).toBe(12);
    expect(result.milestones[2]!.paymentNumber).toBe(18);
    expect(result.milestones[3]!.paymentNumber).toBe(24);
  });

  it("4 milestones qualifies for BrightWay+ graduation", () => {
    const result = trackMilestoneProgress({ milestonesToShow: 4 });
    expect(result.graduatedToBrightwayPlus).toBe(true);
    expect(result.milestones[3]!.description).toContain("BrightWay+");
  });

  it("alternating preference chooses APR first, then limit", () => {
    const result = trackMilestoneProgress({
      rewardPreference: "alternating",
      milestonesToShow: 2,
    });
    expect(result.milestones[0]!.rewardChosen).toBe("apr_decrease");
    expect(result.milestones[1]!.rewardChosen).toBe("credit_limit_increase");
  });

  it("APR preference always decreases APR each milestone", () => {
    const result = trackMilestoneProgress({
      rewardPreference: "apr_decrease",
      milestonesToShow: 4,
    });
    for (const milestone of result.milestones) {
      expect(milestone.rewardChosen).toBe("apr_decrease");
    }
  });

  it("uses default starting values when none provided", () => {
    const result = trackMilestoneProgress({});
    expect(result.milestones[0]!.apr).toBeLessThan(35.99); // APR decreased
  });
});

// ============================================================
// PII Filter
// ============================================================
describe("PII Detection", () => {
  it("detects SSN pattern 123-45-6789", async () => {
    const { containsPii } = await import("../middleware/pii-filter.js");
    expect(containsPii("My SSN is 123-45-6789")).toBe(true);
  });

  it("detects SSN with spaces 123 45 6789", async () => {
    const { containsPii } = await import("../middleware/pii-filter.js");
    expect(containsPii("SSN: 123 45 6789")).toBe(true);
  });

  it("detects credit card number", async () => {
    const { containsPii } = await import("../middleware/pii-filter.js");
    expect(containsPii("My card number is 4111111111111111")).toBe(true);
    expect(containsPii("Card: 4111-1111-1111-1111")).toBe(true);
  });

  it("passes normal messages without PII", async () => {
    const { containsPii } = await import("../middleware/pii-filter.js");
    expect(containsPii("What is the BrightWay APR?")).toBe(false);
    expect(containsPii("I spend about $500 a month")).toBe(false);
    expect(containsPii("How do Milestones work?")).toBe(false);
  });
});
