// Types
export type {
  CreditCard,
  MilestoneConfig,
  MilestoneReward,
} from "./types/products.js";

export type {
  ChatMessage,
  ContentBlock,
  TextBlock,
  ToolUseBlock,
  ToolResultBlock,
  ChatRequest,
  Session,
  StreamEventType,
  TextStreamEvent,
  ToolCallStreamEvent,
  ToolResultStreamEvent,
  DoneStreamEvent,
  ErrorStreamEvent,
  StreamEvent,
} from "./types/chat.js";

export type {
  CalcRequest,
  CalcResult,
  CompareRequest,
  CompareResult,
  ComparisonDimension,
  CreditScoreInput,
  CreditScoreProjection,
  CreditScoreResult,
  MilestoneInput,
  MilestoneSnapshot,
  MilestoneResult,
} from "./types/calculator.js";

// Knowledge Base
export {
  BRIGHTWAY_CARDS,
  COMPETITOR_CARDS,
  ALL_CARDS,
  getCardById,
  getBrightwayCards,
  getCompetitorCards,
} from "./knowledge-base/index.js";
