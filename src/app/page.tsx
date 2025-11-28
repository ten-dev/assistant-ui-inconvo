"use client";

import { AssistantSidebar } from "~/components/assistant-ui/assistant-sidebar";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";

export default function HomePage() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantSidebar
        mainPanelProps={{ defaultSize: 70, minSize: 40 }}
        threadPanelProps={{ defaultSize: 30, minSize: 20 }}
      >
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              Your <span className="text-[hsl(280,100%,70%)]">React</span> App
            </h1>
          </div>
        </main>
      </AssistantSidebar>
    </AssistantRuntimeProvider>
  );
}
