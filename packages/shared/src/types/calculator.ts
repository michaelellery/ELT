// packages/shared/src/types/calculator.ts

export interface CalcRequest {
  monthlySpending: number;
  annualFee: number;
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
  cards: import("./products.js").CreditCard[];
  dimensions: ComparisonDimension[];
  verdict: string;
}

export interface MilestoneSnapshot {
  milestoneNumber: number;
  paymentCount: number;
  apr: number;
  creditLimit: number;
  rewardType: "apr_decrease" | "credit_limit_increase";
  isGraduation: boolean;
}

export interface MilestoneProjection {
  milestones: MilestoneSnapshot[];
  graduatesAt?: number;
  graduationCard?: string;
}

export interface ScoreProjectionMonth {
  month: number;
  scoreLow: number;
  scoreMid: number;
  scoreHigh: number;
}

export interface CreditScoreProjection {
  currentScore: number;
  projectionMonths: number;
  monthlyData: ScoreProjectionMonth[];
  disclaimer: string;
}
