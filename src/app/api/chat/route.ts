import { azure } from "@ai-sdk/azure";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import Inconvo from "@inconvoai/node";
import { inconvoTools } from "@ten-dev/node-ai-sdk";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const inconvo = new Inconvo();

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
    model: azure("gpt-5.1-chat"),
    stopWhen: stepCountIs(5),
    system,
    messages: convertToModelMessages(messages),
    tools: {
      ...frontendTools(tools),
      ...inconvoTools({
        inconvo,
        getUserContext: async () => userContext,
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
