import { useState, useCallback } from "react";
import { round2 } from "../lib/formatters.js";
import type { CalcResultData } from "../lib/types.js";

export interface CalcInputState {
  monthlySpending: number;
  annualFee: number;
  carriesBalance: boolean;
  averageBalance: number;
  cardId: string;
}

const DEFAULT_INPUT: CalcInputState = {
  monthlySpending: 500,
  annualFee: 49,
  carriesBalance: false,
  averageBalance: 300,
  cardId: "brightway-standard",
};

function getApr(cardId: string): number {
  switch (cardId) {
    case "brightway-cashback":
      return 35.99;
    case "brightway-plus":
      return 35.99;
    default:
      return 35.99;
  }
}

function getCashBackRate(cardId: string): number {
  switch (cardId) {
    case "brightway-cashback":
      return 0.015;
    case "brightway-plus":
      return 0.01;
    default:
      return 0.01;
  }
}

function buildExplanation(
  netBenefit: number,
  _interestCost: number | undefined,
  trueNet: number | undefined,
): string {
  if (trueNet !== undefined) {
    if (trueNet > 0) {
      return `Even after interest charges, you come out ahead by ${round2(trueNet).toFixed(2)} annually. Great if you manage the balance.`;
    }
    return `Carrying a balance erases your cash back and then some. Pay in full each month to benefit from this card.`;
  }
  if (netBenefit > 0) {
    return `This card works in your favor — you'll earn more in cash back than you pay in annual fees.`;
  }
  if (netBenefit > -20) {
    return `It's roughly break-even. You might still value the credit-building benefits.`;
  }
  return `The annual fee outweighs the cash back at this spending level. Consider a lower fee tier.`;
}

export function useCalculator(prefill?: Partial<CalcInputState>) {
  const [input, setInput] = useState<CalcInputState>({ ...DEFAULT_INPUT, ...prefill });

  const compute = useCallback((inp: CalcInputState): CalcResultData => {
    const annualSpending = inp.monthlySpending * 12;
    const cashBackRate = getCashBackRate(inp.cardId);
    const annualCashBack = round2(annualSpending * cashBackRate);
    const fee = inp.annualFee;
    const netBenefit = round2(annualCashBack - fee);

    let interestCost: number | undefined;
    let trueNet: number | undefined;

    if (inp.carriesBalance && inp.averageBalance > 0) {
      const apr = getApr(inp.cardId) / 100;
      interestCost = round2(inp.averageBalance * apr);
      trueNet = round2(netBenefit - interestCost);
    }

    const rec: CalcResultData["recommendation"] =
      trueNet !== undefined
        ? trueNet > 0
          ? "positive"
          : "negative"
        : netBenefit > 0
          ? "positive"
          : netBenefit > -20
            ? "cautious"
            : "negative";

    return {
      annualCashBack,
      annualFee: fee,
      netBenefit,
      interestCost,
      trueNet,
      recommendation: rec,
      explanation: buildExplanation(netBenefit, interestCost, trueNet),
    };
  }, []);

  const result = compute(input);

  const updateInput = useCallback(<K extends keyof CalcInputState>(
    key: K,
    value: CalcInputState[K],
  ) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { input, updateInput, result, setInput };
}
