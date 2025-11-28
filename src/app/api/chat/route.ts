import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool } from "ai";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
// import { chatWithDataTools } from "@inconvo/data-chat-tools-ai-sdk";
import { z } from "zod";
import Inconvo from "@inconvoai/node";
import type { ResponseCreateResponse } from "@inconvoai/node/resources/conversations";

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

  // TODO: get the user context from the request (e.g., auth token)
  const userContext = {
    organisationId: 1,
  };

  const messageDataAnalystDescription = [
    `Send a message to your conversation with the data analyst.`,
    `The analyst can reply with either chart, text or table depending on what you ask.`,
    `You may ask additional clarifying follow up questions.`,
    `If you don't get the answer you need, you can ask for it in a different way.`,
    `Always keep your data queries brief and with a singular goal.`,
    `You can use the 'get_data_summary' tool to get an overview of the data connected.`,
  ].join("\n");

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
      get_data_summary: tool({
        description:
          "Use this tool before you ask your first question. You will get a high level summary of the connected data. This can be used to get an overview of the data before asking more specific questions.",
        inputSchema: z.object({}),
        execute: async () => {
          return `• organisations - Stores information about organizations including their name and creation date.
• users - Contains user details such as contact info, location, and association with an organization.
• products - Holds product data including category, price, stock level, and linked organization.
• orders - Records purchase transactions linking users, products, and organizations with pricing details.
• reviews - Captures user ratings and comments on products within organizations.`;
        },
      }),
      start_data_analyst_conversation: tool({
        description:
          "Begin a new conversation with the data analyst. Returns a new conversation ID which can be used with the 'message_data_analyst' tool. When messaging with the same conversation ID, the data analyst will remember the context of previous messages. You can start a new conversation at any time, even if you already have an active conversation. However, only one conversation can be active at a time. You can get the active conversation ID using the 'get_active_conversation_id' tool.",
        inputSchema: z.object({}),
        execute: async () => {
          const conversation = await inconvo.conversations.create({
            context: userContext,
          });
          if (!conversation?.id) {
            return "Failed to start conversation with data analyst.";
          }
          return {
            conversationId: conversation.id,
          };
        },
      }),
      message_data_analyst: tool({
        description: messageDataAnalystDescription,
        inputSchema: z.object({
          conversationId: z.string().describe("The ID of the conversation."),
          message: z
            .string()
            .describe("The message to send to the data analyst."),
        }),
        execute: async ({ conversationId, message }) => {
          const stream = inconvo.conversations.response.create(conversationId, {
            message,
            stream: true,
          });
          let finalResponse = null;
          for await (const chunk of stream) {
            if (chunk.type === "response.completed") {
              finalResponse = chunk.response;
              break;
            }
          }
          if (!finalResponse) {
            throw new Error("No response received from Inconvo");
          }
          const contentText = normalizeResponseToText(finalResponse);
          return contentText;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

function normalizeResponseToText(response: ResponseCreateResponse): string {
  if (!response || typeof response !== "object") {
    return "(empty response)";
  }

  // The message field contains the text content/explanation
  if (response.message) {
    return response.message;
  }

  // Fallback to JSON representation if no message field
  try {
    return JSON.stringify(response, null, 2);
  } catch (err) {
    return `Failed to parse response: ${(err as Error).message}`;
  }
}
