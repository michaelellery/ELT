import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble.js";
import { TypingIndicator } from "./TypingIndicator.js";
import type { ChatMessage } from "../../lib/types.js";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isStreaming]);

  // Also scroll when streaming content grows
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-4 flex flex-col gap-4"
      role="log"
      aria-label="Chat conversation"
      aria-live="polite"
      id="chat-messages"
    >
      {messages.map((message, idx) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLastMessage={idx === messages.length - 1}
        />
      ))}

      {/* Show typing indicator only when streaming but the last message is empty */}
      {isStreaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
        <TypingIndicator />
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
