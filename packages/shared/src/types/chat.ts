export interface ChatMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export type ContentBlock =
  | TextBlock
  | ToolUseBlock
  | ToolResultBlock;

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string | { type: "text"; text: string }[];
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface Session {
  messages: ChatMessage[];
  createdAt: number;
  lastAccessedAt: number;
}

// SSE Event Types
export type StreamEventType = "text" | "tool_call" | "tool_result" | "done" | "error";

export interface TextStreamEvent {
  type: "text";
  text: string;
}

export interface ToolCallStreamEvent {
  type: "tool_call";
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultStreamEvent {
  type: "tool_result";
  name: string;
  result: unknown;
}

export interface DoneStreamEvent {
  type: "done";
}

export interface ErrorStreamEvent {
  type: "error";
  message: string;
}

export type StreamEvent =
  | TextStreamEvent
  | ToolCallStreamEvent
  | ToolResultStreamEvent
  | DoneStreamEvent
  | ErrorStreamEvent;
