// packages/shared/src/types/chat.ts
// Chat message and session types

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResultEvent[];
  timestamp?: number;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface StreamEvent {
  type: "text" | "tool_call" | "tool_result" | "done" | "error";
}

export interface TextEvent extends StreamEvent {
  type: "text";
  text: string;
}

export interface ToolCallEvent extends StreamEvent {
  type: "tool_call";
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultEvent extends StreamEvent {
  type: "tool_result";
  name: string;
  result: unknown;
}

export interface DoneEvent extends StreamEvent {
  type: "done";
}

export interface ErrorEvent extends StreamEvent {
  type: "error";
  message: string;
}

export type AnyStreamEvent =
  | TextEvent
  | ToolCallEvent
  | ToolResultEvent
  | DoneEvent
  | ErrorEvent;
