// packages/web/src/__tests__/FinancialCalculator.test.tsx
// Tests for FinancialCalculator widget — ELT-12

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// TODO (Dev 1): Import actual component when ELT-15 is complete
// import FinancialCalculator from "../components/widgets/FinancialCalculator";

// Inline calculator logic (mirrors backend)
function calculateNetBenefit(monthlySpending: number, annualFee: number): number {
  const annualCashBack = monthlySpending * 12 * 0.01;
  return Math.round((annualCashBack - annualFee) * 100) / 100;
}

// Mock component for testing structure
interface MockCalcProps {
  prefilled?: {
    monthlySpending?: number;
    annualFee?: number;
    netBenefit?: number;
  };
}

const MockFinancialCalculator = ({ prefilled }: MockCalcProps) => {
  const net = prefilled?.netBenefit ?? calculateNetBenefit(
    prefilled?.monthlySpending ?? 500,
    prefilled?.annualFee ?? 49
  );

  return (
    <div data-testid="financial-calculator">
      <h3>Financial Calculator</h3>
      <div data-testid="monthly-spending-input">
        <label>Monthly Spending</label>
        <input
          type="number"
          defaultValue={prefilled?.monthlySpending ?? 500}
          data-testid="input-monthly-spending"
        />
      </div>
      <div data-testid="annual-fee-select">
        <label>Annual Fee</label>
        <select data-testid="select-annual-fee" defaultValue={prefilled?.annualFee ?? 49}>
          <option value={0}>$0</option>
          <option value={49}>$49</option>
          <option value={75}>$75</option>
          <option value={89}>$89</option>
        </select>
      </div>
      <div data-testid="results">
        <div data-testid="cash-back-result">
          Annual Cash Back: ${Math.round((prefilled?.monthlySpending ?? 500) * 12 * 0.01 * 100) / 100}
        </div>
        <div data-testid="net-benefit-result" className={net >= 0 ? "text-green-600" : "text-red-600"}>
          Net Benefit: ${net}
        </div>
        <div data-testid="recommendation">
          {net > 0 ? "✅ Positive value" : net >= -20 ? "⚠️ Marginal" : "❌ Not recommended"}
        </div>
      </div>
    </div>
  );
};

describe("FinancialCalculator", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<MockFinancialCalculator />);
      expect(screen.getByTestId("financial-calculator")).toBeTruthy();
    });

    it("shows monthly spending input", () => {
      render(<MockFinancialCalculator />);
      expect(screen.getByTestId("input-monthly-spending")).toBeTruthy();
    });

    it("shows annual fee selector", () => {
      render(<MockFinancialCalculator />);
      expect(screen.getByTestId("select-annual-fee")).toBeTruthy();
    });

    it("shows results section", () => {
      render(<MockFinancialCalculator />);
      expect(screen.getByTestId("results")).toBeTruthy();
    });
  });

  describe("Calculation results display", () => {
    it("shows correct cash back for $500/mo ($60/year)", () => {
      render(<MockFinancialCalculator prefilled={{ monthlySpending: 500 }} />);
      expect(screen.getByText(/Annual Cash Back: \$60/)).toBeTruthy();
    });

    it("shows positive recommendation for good value", () => {
      render(<MockFinancialCalculator prefilled={{ monthlySpending: 500, annualFee: 49, netBenefit: 11 }} />);
      expect(screen.getByText("✅ Positive value")).toBeTruthy();
    });

    it("shows negative recommendation for poor value", () => {
      render(<MockFinancialCalculator prefilled={{ monthlySpending: 100, annualFee: 89, netBenefit: -77 }} />);
      expect(screen.getByText("❌ Not recommended")).toBeTruthy();
    });

    it("net benefit is color-coded green for positive", () => {
      render(<MockFinancialCalculator prefilled={{ monthlySpending: 500, annualFee: 49, netBenefit: 11 }} />);
      const netEl = screen.getByTestId("net-benefit-result");
      expect(netEl.className).toContain("text-green-600");
    });

    it("net benefit is color-coded red for negative", () => {
      render(<MockFinancialCalculator prefilled={{ monthlySpending: 100, annualFee: 89, netBenefit: -77 }} />);
      const netEl = screen.getByTestId("net-benefit-result");
      expect(netEl.className).toContain("text-red-600");
    });
  });

  describe("Pre-filled mode (from tool result)", () => {
    it("renders with pre-filled data from tool result", () => {
      render(
        <MockFinancialCalculator
          prefilled={{
            monthlySpending: 750,
            annualFee: 49,
            netBenefit: 41,
          }}
        />
      );
      expect(screen.getByTestId("financial-calculator")).toBeTruthy();
    });
  });

  // TODO (Dev 1): Integration tests once real component exists
  it.todo("recalculates in real-time as monthly spending changes");
  it.todo("recalculates when annual fee dropdown changes");
  it.todo("shows interest cost section when carries balance toggle is on");
  it.todo("interest cost section is hidden when carries balance is off");
});
