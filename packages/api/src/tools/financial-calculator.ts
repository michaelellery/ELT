import { getCardById } from "@elt/shared";
import type { CalcResult } from "@elt/shared";

interface FinancialFitnessInput {
  monthly_spending: number;
  annual_fee?: number;
  carries_balance?: boolean;
  average_balance?: number;
  card_id?: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateFinancialFitness(input: FinancialFitnessInput): CalcResult {
  const cardId = input.card_id ?? "brightway-standard";
  const card = getCardById(cardId);

  const cashBackRate = card?.cashBack.enabled ? card.cashBack.baseRate / 100 : 0.01;
  const annualSpending = input.monthly_spending * 12;
  const annualCashBack = round2(annualSpending * cashBackRate);
  const annualFee = input.annual_fee ?? 49;
  const netBenefit = round2(annualCashBack - annualFee);

  let interestCost: number | undefined;
  let trueNet: number | undefined;

  if (input.carries_balance && input.average_balance && input.average_balance > 0) {
    const apr = card?.apr.regular ?? 35.99;
    // Simple annual interest on average balance
    interestCost = round2(input.average_balance * (apr / 100));
    trueNet = round2(netBenefit - interestCost);
  }

  let recommendation: "positive" | "cautious" | "negative";

  const effectiveNet = trueNet ?? netBenefit;
  if (effectiveNet > 20) {
    recommendation = "positive";
  } else if (effectiveNet >= -20) {
    recommendation = "cautious";
  } else {
    recommendation = "negative";
  }

  const explanation = buildExplanation({
    annualCashBack,
    annualFee,
    netBenefit,
    interestCost,
    trueNet,
    recommendation,
    carriesBalance: input.carries_balance ?? false,
    monthlySpending: input.monthly_spending,
  });

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

interface ExplanationParams {
  annualCashBack: number;
  annualFee: number;
  netBenefit: number;
  interestCost?: number;
  trueNet?: number;
  recommendation: "positive" | "cautious" | "negative";
  carriesBalance: boolean;
  monthlySpending: number;
}

function buildExplanation(p: ExplanationParams): string {
  const parts: string[] = [];

  parts.push(
    `With $${p.monthlySpending}/month in spending, you'd earn $${p.annualCashBack} in annual cash back at 1%.`
  );

  if (p.annualFee > 0) {
    parts.push(`After the $${p.annualFee} annual fee, your net benefit is $${p.netBenefit}.`);
  } else {
    parts.push(`With no annual fee, your net benefit is $${p.annualCashBack}.`);
  }

  if (p.carriesBalance && p.interestCost !== undefined) {
    parts.push(
      `However, carrying a balance at 35.99% APR would cost approximately $${p.interestCost} per year in interest.`
    );
    if (p.trueNet !== undefined) {
      parts.push(
        `Your true net after interest: $${p.trueNet} (${p.trueNet < 0 ? "net loss" : "net gain"}).`
      );
    }
  }

  if (p.recommendation === "positive") {
    parts.push(
      "This card looks like a solid choice for you — the cash back more than covers the annual fee."
    );
  } else if (p.recommendation === "cautious") {
    parts.push(
      "This card is borderline. The benefits are modest — consider whether credit building is worth the cost."
    );
  } else {
    parts.push(
      "⚠️ Caution: The costs likely outweigh the benefits for your situation. Consider a $0-fee option or increasing your spending to make the rewards worthwhile."
    );
  }

  if (p.carriesBalance) {
    parts.push(
      "Important: At 35.99% APR, carrying a balance quickly erases cash back gains. Paying in full each month is strongly recommended."
    );
  }

  return parts.join(" ");
}
