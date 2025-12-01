import { azure } from "@ai-sdk/azure";
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
// import { inconvoTools } from "@inconvoai/ai-sdk";
import { z } from "zod";
import Inconvo from "@inconvoai/node";

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

  const messageDataAnalystDescription = [
    `Send a message to your conversation with the data analyst.`,
    `The analyst can reply with either chart, text or table depending on what you ask.`,
    `You may ask additional clarifying follow up questions.`,
    `If you don't get the answer you need, you can ask for it in a different way.`,
    `Always keep your data queries brief and with a singular goal.`,
    `You can use the 'get_data_summary' tool to get an overview of the data connected.`,
    `Do not repeat information already provided by the analyst in your user message`,
  ].join("\n");

  const result = streamText({
    model: azure("gpt-5.1-chat"),
    stopWhen: stepCountIs(5),
    system,
    messages: convertToModelMessages(messages),
    tools: {
      // Wrap frontend tools with frontendTools helper
      ...frontendTools(tools),
      // Backend tools
      get_data_summary: tool({
        description:
          "Use this tool before you ask your first question. You will get a high level summary of the connected data. This can be used to get an overview of the data before asking more specific questions.",
        inputSchema: z.object({}),
        execute: async () => {
          const { dataSummary } = await inconvo.agents.dataSummary.retrieve();
          return dataSummary;
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
          return JSON.stringify(finalResponse);
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
