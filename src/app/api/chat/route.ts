import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { inconvoTools } from "@inconvoai/node-ai-sdk";

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

  // In production get the user context from the request (e.g., auth token)
  const userContext = {
    organisationId: 1,
  };

  const result = streamText({
    model: openai("gpt-5-chat-latest"),
    stopWhen: stepCountIs(5),
    system,
    messages: convertToModelMessages(messages),
    tools: {
      ...frontendTools(tools),
      ...inconvoTools({
        userContext,
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
