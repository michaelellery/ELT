import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../prompts/system.js";
import { TOOL_DEFINITIONS } from "../tools/definitions.js";
import { executeTools } from "./tools.js";
import { getOrCreateSession, addMessage, getMessages } from "./session.js";
import type { StreamEvent } from "@elt/shared";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-20250514";
const MAX_TOKENS = 4096;
const MAX_TOOL_LOOPS = 3;

export async function* streamChatResponse(
  sessionId: string,
  userMessage: string
): AsyncGenerator<StreamEvent> {
  // Ensure session exists and add user message
  getOrCreateSession(sessionId);
  addMessage(sessionId, { role: "user", content: userMessage });

  let toolLoopCount = 0;
  let continueLoop = true;

  while (continueLoop && toolLoopCount <= MAX_TOOL_LOOPS) {
    continueLoop = false;

    const messages = getMessages(sessionId);

    let stream: ReturnType<typeof client.messages.stream>;
    try {
      stream = client.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(),
        tools: TOOL_DEFINITIONS,
        messages,
      });
    } catch (err) {
      yield {
        type: "error",
        message: err instanceof Error ? err.message : "Failed to connect to AI service",
      };
      return;
    }

    // Stream text deltas
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text", text: event.delta.text };
      }
    }

    // Get final message
    let finalMessage: Anthropic.Message;
    try {
      finalMessage = await stream.finalMessage();
    } catch (err) {
      yield {
        type: "error",
        message: "Failed to get final response from AI",
      };
      return;
    }

    // Add assistant response to session
    addMessage(sessionId, {
      role: "assistant",
      content: finalMessage.content,
    });

    // Check for tool use
    const toolUseBlocks = finalMessage.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (toolUseBlocks.length > 0 && finalMessage.stop_reason === "tool_use") {
      toolLoopCount++;

      if (toolLoopCount > MAX_TOOL_LOOPS) {
        yield {
          type: "error",
          message: "Max tool call limit reached. Please try a simpler query.",
        };
        break;
      }

      // Emit tool_call events for each tool being called
      for (const block of toolUseBlocks) {
        yield {
          type: "tool_call",
          name: block.name,
          input: block.input as Record<string, unknown>,
        };
      }

      // Execute tools
      const toolResults = await executeTools(toolUseBlocks);

      // Emit tool_result events
      for (let i = 0; i < toolUseBlocks.length; i++) {
        const toolBlock = toolUseBlocks[i]!;
        const toolResult = toolResults[i]!;
        yield {
          type: "tool_result",
          name: toolBlock.name,
          result: JSON.parse(toolResult.content),
        };
      }

      // Add tool results to session and loop back
      addMessage(sessionId, {
        role: "user",
        content: toolResults,
      });

      continueLoop = true;
    }
  }

  yield { type: "done" };
}
