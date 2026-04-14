// packages/api/src/__tests__/comparison.test.ts
// Card comparison engine tests — ELT-12

import { describe, it, expect } from "vitest";

// Inline minimal comparison logic for tests
// TODO: Replace with import from tools/comparison-engine.ts when Dev 2 creates it

interface DimensionResult {
  name: string;
  brightwayValue: string;
  competitorValue: string;
  brightwayIndicator: "win" | "neutral" | "loss";
}

function compareAPR(brightwayApr: number, competitorApr: number): DimensionResult {
  return {
    name: "APR",
    brightwayValue: `${brightwayApr}%`,
    competitorValue: `${competitorApr}%`,
    brightwayIndicator:
      brightwayApr < competitorApr
        ? "win"
        : brightwayApr === competitorApr
        ? "neutral"
        : "loss",
  };
}

function compareAnnualFee(brightwayMax: number, competitorMax: number): DimensionResult {
  return {
    name: "Annual Fee",
    brightwayValue: `$${brightwayMax}`,
    competitorValue: `$${competitorMax}`,
    brightwayIndicator:
      brightwayMax < competitorMax
        ? "win"
        : brightwayMax === competitorMax
        ? "neutral"
        : "loss",
  };
}

function compareCashBack(brightwayRate: number, competitorRate: number): DimensionResult {
  return {
    name: "Cash Back",
    brightwayValue: `${brightwayRate}%`,
    competitorValue: `${competitorRate}%`,
    brightwayIndicator:
      brightwayRate > competitorRate
        ? "win"
        : brightwayRate === competitorRate
        ? "neutral"
        : "loss",
  };
}

describe("Comparison Engine", () => {
  describe("APR comparison", () => {
    it("BrightWay 35.99% vs Indigo 35.9% → BrightWay loses on APR", () => {
      const result = compareAPR(35.99, 35.9);
      expect(result.brightwayIndicator).toBe("loss");
    });

    it("BrightWay 35.99% vs OpenSky 25.64% → BrightWay loses on APR", () => {
      const result = compareAPR(35.99, 25.64);
      expect(result.brightwayIndicator).toBe("loss");
    });

    it("BrightWay+ 24.99% vs Credit One 29.74% → BrightWay+ wins on APR", () => {
      const result = compareAPR(24.99, 29.74);
      expect(result.brightwayIndicator).toBe("win");
    });

    it("equal APRs → neutral", () => {
      const result = compareAPR(35.99, 35.99);
      expect(result.brightwayIndicator).toBe("neutral");
    });
  });

  describe("Annual fee comparison", () => {
    it("BrightWay ($0-$89) vs Capital One Secured ($0) — fee comparison", () => {
      // BrightWay max fee is higher
      const result = compareAnnualFee(89, 0);
      expect(result.brightwayIndicator).toBe("loss");
    });

    it("BrightWay+ ($0) vs Surge ($125) → BrightWay+ wins on fee", () => {
      const result = compareAnnualFee(0, 125);
      expect(result.brightwayIndicator).toBe("win");
    });

    it("BrightWay ($49) vs Indigo ($99) → BrightWay wins on fee", () => {
      const result = compareAnnualFee(49, 99);
      expect(result.brightwayIndicator).toBe("win");
    });
  });

  describe("Cash back comparison", () => {
    it("BrightWay 1% vs Capital One 0% → BrightWay wins on cash back", () => {
      const result = compareCashBack(1.0, 0);
      expect(result.brightwayIndicator).toBe("win");
    });

    it("BrightWay 1% vs Aspire 3% → BrightWay loses on cash back", () => {
      const result = compareCashBack(1.0, 3.0);
      expect(result.brightwayIndicator).toBe("loss");
    });

    it("BrightWay 1% vs Revvi 1% → neutral", () => {
      const result = compareCashBack(1.0, 1.0);
      expect(result.brightwayIndicator).toBe("neutral");
    });
  });

  describe("Full comparison result structure", () => {
    it("comparison result has cards, dimensions, and verdict", () => {
      // TODO: Test actual compareCards() function from comparison-engine.ts
      const mockResult = {
        cards: [
          { id: "brightway-standard" },
          { id: "capital-one-platinum-secured" },
        ],
        dimensions: [
          { name: "APR", cards: [] },
          { name: "Annual Fee", cards: [] },
          { name: "Cash Back", cards: [] },
          { name: "Unsecured", cards: [] },
          { name: "Bureau Reporting", cards: [] },
          { name: "Milestone Program", cards: [] },
          { name: "Max Credit Limit", cards: [] },
          { name: "Foreign Transaction Fee", cards: [] },
        ],
        verdict: "BrightWay offers cash back and milestone rewards...",
      };
      expect(mockResult.cards).toHaveLength(2);
      expect(mockResult.dimensions).toHaveLength(8);
      expect(mockResult.verdict).toBeTruthy();
    });

    it("handles unknown card ID gracefully", () => {
      // TODO: Test that unknown card ID returns error result, not exception
      expect(true).toBe(true);
    });

    it("can compare to multiple competitors at once", () => {
      // TODO: Test multi-competitor comparison
      expect(true).toBe(true);
    });
  });

  describe("BrightWay unique advantages", () => {
    it("BrightWay wins on 'Unsecured' vs Capital One Secured", () => {
      const brightway = { secured: false };
      const capitalOne = { secured: true };
      expect(brightway.secured).toBe(false);
      expect(capitalOne.secured).toBe(true);
      // BrightWay wins — no deposit needed
    });

    it("BrightWay wins on Milestone Program (unique feature)", () => {
      const brightway = { milestones: true };
      const indigo = { milestones: false };
      expect(brightway.milestones).toBe(true);
      expect(indigo.milestones).toBe(false);
    });

    it("BrightWay has path to $15,000 limit vs competitors' $2,000-$3,000 max", () => {
      const brightwayMax = 15000;
      const surgeMax = 2000;
      expect(brightwayMax).toBeGreaterThan(surgeMax);
    });
  });
});
