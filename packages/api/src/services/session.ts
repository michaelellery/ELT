import type { Session } from "@elt/shared";
import type Anthropic from "@anthropic-ai/sdk";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 20;

// In-memory session store
const sessions = new Map<string, Session>();

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastAccessedAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

export function getOrCreateSession(sessionId: string): Session {
  cleanupExpiredSessions();

  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      messages: [],
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };
    sessions.set(sessionId, session);
  } else {
    session.lastAccessedAt = Date.now();
  }

  return session;
}

export function addMessage(
  sessionId: string,
  message: Anthropic.MessageParam
): void {
  const session = getOrCreateSession(sessionId);
  session.messages.push(message as unknown as Session["messages"][number]);

  // Enforce max messages (keep last MAX_MESSAGES)
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }
}

export function getMessages(sessionId: string): Anthropic.MessageParam[] {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return session.messages as unknown as Anthropic.MessageParam[];
}

export function sessionExists(sessionId: string): boolean {
  return sessions.has(sessionId);
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// Exported for testing
export function getSessionCount(): number {
  return sessions.size;
}
