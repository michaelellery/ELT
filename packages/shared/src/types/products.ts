// packages/shared/src/types/products.ts
// CreditCard and related product types

export interface MilestoneReward {
  type: "apr_decrease" | "credit_limit_increase";
  description: string;
}

export interface MilestoneConfig {
  paymentsPerMilestone: number;
  rewards: MilestoneReward[];
  graduationMilestones: number;
  graduationCard: string;
  forfeitOnLatePayment: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  network: "Mastercard" | "Visa" | "Amex" | "Discover";
  targetMarket: "subprime" | "near-prime" | "prime";
  apr: {
    regular: number;
    type: "fixed" | "variable";
    floor?: number;
    introRate?: number;
    introPeriodMonths?: number;
  };
  annualFee: {
    min: number;
    max: number;
    waivable: boolean;
  };
  cashBack: {
    enabled: boolean;
    baseRate: number;
    categoryRates?: { category: string; rate: number }[];
  };
  creditLimit: {
    startingMin: number;
    startingMax: number;
    eventualMax: number;
  };
  fees: {
    foreignTransaction: number;
    cashAdvance?: string;
    latePayment?: string;
  };
  features: string[];
  milestones?: MilestoneConfig;
  bureauReporting: ("Equifax" | "Experian" | "TransUnion")[];
  secured: boolean;
  depositRequired: boolean;
  inviteOnly: boolean;
  website?: string;
  phone?: string;
  dataAsOf: string;
}
