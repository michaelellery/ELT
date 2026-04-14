import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTime } from "../../lib/formatters.js";
import type { ChatMessage, ToolResultData } from "../../lib/types.js";
import { FinancialCalculator } from "../widgets/FinancialCalculator.js";
import { ComparisonTable } from "../widgets/ComparisonTable.js";
import { MilestoneTracker } from "../widgets/MilestoneTracker.js";
import { CardSummaryCard } from "../widgets/CardSummaryCard.js";

interface MessageBubbleProps {
  message: ChatMessage;
  isLastMessage?: boolean;
}

function ToolWidget({ toolResult }: { toolResult: ToolResultData }) {
  switch (toolResult.toolName) {
    case "calculate_financial_fitness":
      return (
        <div className="mt-3">
          <FinancialCalculator prefillResult={toolResult.result.mock ? undefined : (toolResult.result as unknown as Parameters<typeof FinancialCalculator>[0]["prefillResult"])} />
        </div>
      );
    case "compare_cards":
      return (
        <div className="mt-3">
          <ComparisonTable data={toolResult.result.mock ? undefined : (toolResult.result as unknown as Parameters<typeof ComparisonTable>[0]["data"])} />
        </div>
      );
    case "track_milestone_progress":
      return (
        <div className="mt-3">
          <MilestoneTracker data={toolResult.result.mock ? undefined : (toolResult.result as unknown as Parameters<typeof MilestoneTracker>[0]["data"])} />
        </div>
      );
    case "get_product_info":
      return (
        <div className="mt-3">
          <CardSummaryCard />
        </div>
      );
    default:
      return null;
  }
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isLastMessage,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && !message.toolResults?.length;

  return (
    <div
      className={`flex gap-3 px-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      role="article"
      aria-label={`${isUser ? "You" : "BrightWay assistant"}: ${message.content.slice(0, 100)}`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white text-xs font-bold mt-0.5"
          style={{ backgroundColor: "var(--omf-navy)" }}
          aria-hidden="true"
        >
          BW
        </div>
      )}

      {/* Bubble Content */}
      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} max-w-[80%] sm:max-w-[75%]`}>
        {/* Main bubble */}
        {(!isEmpty || message.isStreaming) && (
          <div
            className={`relative px-4 py-3 shadow-sm ${
              isUser
                ? "rounded-[12px_2px_12px_12px] text-white"
                : "rounded-[2px_12px_12px_12px]"
            } ${message.error ? "border-l-4 border-[--error]" : ""}`}
            style={
              isUser
                ? { backgroundColor: "var(--chat-user-bg)" }
                : {
                    backgroundColor: "var(--chat-bot-bg)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }
            }
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div
                className={`prose-chat text-sm ${message.isStreaming && isLastMessage ? "streaming-cursor" : ""}`}
              >
                {message.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.isStreaming && (
                    <span className="text-[--gray-500] text-sm">Thinking…</span>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Tool result widgets */}
        {!isUser && message.toolResults?.map((tr, i) => (
          <ToolWidget key={`${tr.toolName}-${i}`} toolResult={tr} />
        ))}

        {/* Timestamp */}
        <time
          className="text-xs text-[--text-secondary] px-1"
          dateTime={message.timestamp.toISOString()}
          aria-label={`Sent at ${formatTime(message.timestamp)}`}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
    </div>
  );
});
