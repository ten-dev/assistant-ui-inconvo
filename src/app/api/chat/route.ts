import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool } from "ai";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
// import { chatWithDataTools } from "@inconvo/data-chat-tools-ai-sdk";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    system,
    tools,
  }: {
    messages: UIMessage[];
    system?: string; // System message forwarded from AssistantChatTransport
    tools?: any; // Frontend tools forwarded from AssistantChatTransport
  } = await req.json();

  const result = streamText({
    model: openai("gpt-5.1-chat-latest"),
    system, // Use the system message from the frontend if provided
    messages: convertToModelMessages(messages),
    tools: {
      // Wrap frontend tools with frontendTools helper
      ...frontendTools(tools),
      // Backend tools
      get_current_weather: tool({
        description: "Get the current weather",
        inputSchema: z.object({
          city: z.string(),
        }),
        execute: async ({ city }) => {
          return `The weather in ${city} is sunny`;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}