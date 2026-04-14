export interface CalcRequest {
  monthlySpending: number;
  annualFee?: number;
  carriesBalance: boolean;
  averageBalance?: number;
  cardId?: string;
}

export interface CalcResult {
  annualCashBack: number;
  annualFee: number;
  netBenefit: number;
  interestCost?: number;
  trueNet?: number;
  recommendation: "positive" | "cautious" | "negative";
  explanation: string;
}

export interface CompareRequest {
  brightwayCardId?: string;
  competitorIds?: string[];
  focusAreas?: string[];
}

export interface ComparisonDimension {
  name: string;
  cards: { cardId: string; value: string; indicator: "win" | "neutral" | "loss" }[];
}

export interface CompareResult {
  cards: { id: string; name: string; issuer: string }[];
  dimensions: ComparisonDimension[];
  verdict: string;
}

export interface CreditScoreInput {
  currentScore: number;
  utilizationPlan?: "low" | "moderate" | "high";
  onTimePayments?: boolean;
  projectionMonths?: number;
}

export interface CreditScoreProjection {
  month: number;
  low: number;
  mid: number;
  high: number;
}

export interface CreditScoreResult {
  projections: CreditScoreProjection[];
  disclaimer: string;
  keyFactors: string[];
}

export interface MilestoneInput {
  startingApr?: number;
  startingCreditLimit?: number;
  milestonesToShow?: number;
  rewardPreference?: "apr_decrease" | "credit_limit_increase" | "alternating";
}

export interface MilestoneSnapshot {
  milestoneNumber: number;
  paymentNumber: number;
  apr: number;
  creditLimit: number;
  rewardChosen: "apr_decrease" | "credit_limit_increase";
  description: string;
}

export interface MilestoneResult {
  milestones: MilestoneSnapshot[];
  graduatedToBrightwayPlus: boolean;
  finalApr: number;
  finalCreditLimit: number;
}
