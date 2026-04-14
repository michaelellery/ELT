import type { CreditScoreInput, CreditScoreResult, CreditScoreProjection } from "@elt/shared";

const DISCLAIMER =
  "⚠️ This is an educational estimate based on general FICO factor weights. It is NOT a guarantee of actual score changes. Your results will depend on your complete credit profile. Always check your score through myFICO, Credit Karma, or your card issuer.";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function simulateCreditScore(input: CreditScoreInput): CreditScoreResult {
  const currentScore = clamp(input.currentScore, 300, 850);
  const utilizationPlan = input.utilizationPlan ?? "moderate";
  const onTimePayments = input.onTimePayments ?? true;
  const projectionMonths = Math.min(Math.max(input.projectionMonths ?? 12, 1), 36);

  // Calculate monthly deltas based on FICO factors
  // Payment History (35%): biggest driver
  const paymentHistoryDeltaPerMonth = onTimePayments ? 1.2 : -3.5;

  // Utilization (30%): immediate impact
  const utilizationBoost =
    utilizationPlan === "low"
      ? 8
      : utilizationPlan === "moderate"
        ? 2
        : -5;

  // New account penalty (10% new inquiries + 15% length of history): initial hit recovers
  // Simulate: -8 initially for new account, recover ~1.5/month
  const newAccountPenalty = -8;
  const monthlyRecovery = 1.5;

  // Credit mix improvement (10%): small boost for new card type
  const creditMixBoost = 5;

  // Headroom: harder to gain points near 850
  const headroomFactor = (850 - currentScore) / 550;

  const projections: CreditScoreProjection[] = [];

  for (let month = 1; month <= projectionMonths; month++) {
    // Cumulative payment history benefit
    const paymentBenefit = paymentHistoryDeltaPerMonth * month * headroomFactor;

    // Utilization applied at month 1, maintained
    const utilBenefit = utilizationBoost * headroomFactor;

    // New account: initial penalty recovers over ~6 months
    const accountEffect =
      month <= 6
        ? newAccountPenalty + monthlyRecovery * (month - 1)
        : 0; // fully recovered after 6 months

    // Credit mix: one-time at month 1
    const mixBenefit = creditMixBoost * headroomFactor;

    const totalDelta = paymentBenefit + utilBenefit + accountEffect + mixBenefit;

    // Low/high variance ±15 points
    const mid = clamp(Math.round(currentScore + totalDelta), 300, 850);
    const low = clamp(mid - 15, 300, 850);
    const high = clamp(mid + 15, 300, 850);

    projections.push({ month, low, mid, high });
  }

  // Build key factors list
  const keyFactors: string[] = [];
  if (onTimePayments) {
    keyFactors.push(
      "On-time payments (35% of FICO): Your biggest lever. Every on-time payment strengthens your history."
    );
  } else {
    keyFactors.push(
      "⚠️ Late payments (35% of FICO): Even one late payment can drop your score 50+ points."
    );
  }

  keyFactors.push(
    utilizationPlan === "low"
      ? "Low utilization (<10%): Excellent — keeping utilization below 10% maximizes this factor."
      : utilizationPlan === "moderate"
        ? "Moderate utilization (10–30%): Good — aim to keep balances below 30% of your limit."
        : "⚠️ High utilization (>30%): This hurts your score. Try to pay down balances each month."
  );

  keyFactors.push(
    "New account: Opening a new card temporarily lowers your score (new inquiry + reduced average age), but this recovers within 3–6 months."
  );

  keyFactors.push(
    "Credit mix: Adding a credit card to your profile can provide a small boost if you only have loans/student debt."
  );

  return {
    projections,
    disclaimer: DISCLAIMER,
    keyFactors,
  };
}
