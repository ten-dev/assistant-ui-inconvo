"use client";

import type { PropsWithChildren } from "react";

import { AssistantRuntimeProvider, AssistantCloud } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";

import { AssistantSidebar } from "~/components/assistant-ui/assistant-sidebar";
import { ThemeProvider } from "~/components/theme-provider";

const assistantCloudBaseUrl = process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL;

export function AppShell({ children }: PropsWithChildren) {
  const runtime = useChatRuntime({
    ...(assistantCloudBaseUrl
      ? {
          cloud: new AssistantCloud({
            baseUrl: assistantCloudBaseUrl,
            anonymous: true,
          }),
        }
      : {}),
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <ThemeProvider disableTransitionOnChange>
      <AssistantRuntimeProvider runtime={runtime}>
        <AssistantSidebar
          mainPanelProps={{ defaultSize: 60, minSize: 30 }}
          threadPanelProps={{ defaultSize: 40, minSize: 20 }}
        >
          {children}
        </AssistantSidebar>
      </AssistantRuntimeProvider>
    </ThemeProvider>
  );
}
