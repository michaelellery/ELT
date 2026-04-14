import { describe, it, expect } from "vitest";
import { calculateFinancialFitness } from "../tools/financial-calculator.js";

describe("calculateFinancialFitness", () => {
  it("$500/month spending, $49 fee, no balance → positive recommendation", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 500,
      annual_fee: 49,
      carries_balance: false,
    });
    // 500 * 12 * 0.01 = 60
    expect(result.annualCashBack).toBe(60);
    expect(result.annualFee).toBe(49);
    // 60 - 49 = 11
    expect(result.netBenefit).toBe(11);
    expect(result.recommendation).toBe("cautious"); // 11 < 20 threshold
    expect(result.interestCost).toBeUndefined();
    expect(result.trueNet).toBeUndefined();
  });

  it("$300/month spending with $49 fee, no balance → cautious or negative", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 300,
      annual_fee: 49,
      carries_balance: false,
    });
    // 300 * 12 * 0.01 = 36
    expect(result.annualCashBack).toBe(36);
    expect(result.netBenefit).toBe(-13); // 36 - 49 = -13
    expect(result.recommendation).toBe("cautious"); // -20 to -13 → cautious
  });

  it("$100/month spending, $89 fee → negative recommendation", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 100,
      annual_fee: 89,
      carries_balance: false,
    });
    // 100 * 12 * 0.01 = 12
    expect(result.annualCashBack).toBe(12);
    expect(result.netBenefit).toBe(-77); // 12 - 89 = -77
    expect(result.recommendation).toBe("negative");
  });

  it("$600/month, $49 fee → positive (net > 20)", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 600,
      annual_fee: 49,
      carries_balance: false,
    });
    // 600 * 12 * 0.01 = 72
    expect(result.annualCashBack).toBe(72);
    expect(result.netBenefit).toBe(23); // 72 - 49 = 23
    expect(result.recommendation).toBe("positive");
  });

  it("carrying $300 balance at 35.99% APR adds $107.97 interest", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 500,
      annual_fee: 49,
      carries_balance: true,
      average_balance: 300,
    });
    // Interest: 300 * 0.3599 = 107.97
    expect(result.interestCost).toBe(107.97);
    expect(result.trueNet).toBeDefined();
    expect(result.trueNet!).toBeLessThan(0);
    expect(result.recommendation).toBe("negative");
  });

  it("$0 spending → zero cash back", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 0,
      annual_fee: 0,
      carries_balance: false,
    });
    expect(result.annualCashBack).toBe(0);
    expect(result.netBenefit).toBe(0);
  });

  it("large spending ($5000/month) with no fee → highly positive", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 5000,
      annual_fee: 0,
      carries_balance: false,
    });
    // 5000 * 12 * 0.01 = 600
    expect(result.annualCashBack).toBe(600);
    expect(result.netBenefit).toBe(600);
    expect(result.recommendation).toBe("positive");
  });

  it("uses BrightWay 1.5% cashback card rate correctly", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 500,
      annual_fee: 49,
      carries_balance: false,
      card_id: "brightway-cashback",
    });
    // 500 * 12 * 0.015 = 90
    expect(result.annualCashBack).toBe(90);
    expect(result.netBenefit).toBe(41); // 90 - 49 = 41
    expect(result.recommendation).toBe("positive");
  });

  it("includes explanation string in result", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 500,
      annual_fee: 49,
      carries_balance: false,
    });
    expect(result.explanation).toBeDefined();
    expect(typeof result.explanation).toBe("string");
    expect(result.explanation.length).toBeGreaterThan(20);
  });

  it("defaults to $49 annual fee when not provided", () => {
    const result = calculateFinancialFitness({
      monthly_spending: 500,
      carries_balance: false,
    });
    expect(result.annualFee).toBe(49);
  });
});
