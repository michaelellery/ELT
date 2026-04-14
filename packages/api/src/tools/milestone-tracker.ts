import type { MilestoneInput, MilestoneResult, MilestoneSnapshot } from "@elt/shared";

const APR_FLOOR = 19.99;
const APR_DECREASE_PER_MILESTONE = 4.0; // approx decrease each time
const CREDIT_LIMIT_INCREASE_PERCENT = 0.25; // 25% increase per milestone
const CREDIT_LIMIT_CEILING = 15000;
const PAYMENTS_PER_MILESTONE = 6;
const GRADUATION_MILESTONES = 4;

export function trackMilestoneProgress(input: MilestoneInput): MilestoneResult {
  const startingApr = input.startingApr ?? 35.99;
  const startingCreditLimit = input.startingCreditLimit ?? 1000;
  const milestonesToShow = Math.min(Math.max(input.milestonesToShow ?? 4, 1), 8);
  const rewardPreference = input.rewardPreference ?? "alternating";

  let currentApr = startingApr;
  let currentLimit = startingCreditLimit;
  const milestones: MilestoneSnapshot[] = [];

  for (let i = 1; i <= milestonesToShow; i++) {
    const paymentNumber = i * PAYMENTS_PER_MILESTONE;

    // Determine which reward to apply
    let rewardChosen: "apr_decrease" | "credit_limit_increase";
    if (rewardPreference === "apr_decrease") {
      rewardChosen = "apr_decrease";
    } else if (rewardPreference === "credit_limit_increase") {
      rewardChosen = "credit_limit_increase";
    } else {
      // alternating: odd milestones → APR decrease, even → credit limit increase
      rewardChosen = i % 2 !== 0 ? "apr_decrease" : "credit_limit_increase";
    }

    // Apply reward (enforce floors/ceilings)
    if (rewardChosen === "apr_decrease") {
      currentApr = Math.max(APR_FLOOR, Math.round((currentApr - APR_DECREASE_PER_MILESTONE) * 100) / 100);
    } else {
      const increase = Math.round(currentLimit * CREDIT_LIMIT_INCREASE_PERCENT);
      currentLimit = Math.min(CREDIT_LIMIT_CEILING, currentLimit + increase);
    }

    const isGraduation = i === GRADUATION_MILESTONES;
    const description = buildMilestoneDescription(i, rewardChosen, currentApr, currentLimit, isGraduation);

    milestones.push({
      milestoneNumber: i,
      paymentNumber,
      apr: currentApr,
      creditLimit: currentLimit,
      rewardChosen,
      description,
    });
  }

  const graduatedToBrightwayPlus = milestonesToShow >= GRADUATION_MILESTONES;

  return {
    milestones,
    graduatedToBrightwayPlus,
    finalApr: currentApr,
    finalCreditLimit: currentLimit,
  };
}

function buildMilestoneDescription(
  milestoneNum: number,
  reward: "apr_decrease" | "credit_limit_increase",
  newApr: number,
  newLimit: number,
  isGraduation: boolean
): string {
  const parts: string[] = [];

  if (reward === "apr_decrease") {
    if (newApr === APR_FLOOR) {
      parts.push(`Milestone ${milestoneNum}: APR reduced to floor — ${newApr}% (minimum possible)`);
    } else {
      parts.push(`Milestone ${milestoneNum}: APR reduced to ${newApr}%`);
    }
  } else {
    parts.push(
      `Milestone ${milestoneNum}: Credit limit increased to $${newLimit.toLocaleString()}`
    );
  }

  if (isGraduation) {
    parts.push("🎓 You've earned BrightWay+ — no more annual fee!");
  }

  return parts.join(" — ");
}
