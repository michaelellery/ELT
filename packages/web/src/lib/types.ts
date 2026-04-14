/**
 * Frontend types for the BrightWay chatbot
 */

export type MessageRole = "user" | "assistant" | "system";

export interface ToolResultData {
  toolName: string;
  result: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolResults?: ToolResultData[];
  error?: boolean;
}

export interface QuickAction {
  label: string;
  emoji: string;
  message: string;
}

export interface MilestoneSnapshot {
  milestoneNumber: number;
  paymentCount: number;
  apr: number;
  creditLimit: number;
  rewardType: "apr_decrease" | "credit_limit_increase";
}

export interface ComparisonDimension {
  name: string;
  cards: {
    cardId: string;
    cardName: string;
    value: string;
    indicator: "win" | "neutral" | "loss";
  }[];
}

export interface CompareResult {
  dimensions: ComparisonDimension[];
  verdict: string;
}

export interface CalcResultData {
  annualCashBack: number;
  annualFee: number;
  netBenefit: number;
  interestCost?: number;
  trueNet?: number;
  recommendation: "positive" | "cautious" | "negative";
  explanation: string;
}

export type Theme = "light" | "dark";
