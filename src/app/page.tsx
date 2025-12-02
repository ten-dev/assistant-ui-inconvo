"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { AssistantSidebar } from "~/components/assistant-ui/assistant-sidebar";
import { AssistantRuntimeProvider, AssistantCloud } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Button } from "~/components/ui/button";

const assistantCloudBaseUrl = process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL;

if (!assistantCloudBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_ASSISTANT_BASE_URL is not set. Please configure it to enable Assistant UI Cloud persistence.",
  );
}

const cloud = new AssistantCloud({
  baseUrl: assistantCloudBaseUrl,
  anonymous: true,
});

export default function HomePage() {
  const runtime = useChatRuntime({
    cloud,
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const toggleLabel = useMemo(() => {
    if (!mounted) return "Toggle theme";
    return resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }, [mounted, resolvedTheme]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantSidebar
        mainPanelProps={{ defaultSize: 60, minSize: 30 }}
        threadPanelProps={{ defaultSize: 40, minSize: 20 }}
      >
        <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors">
          <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
            <Button
              variant="outline"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              disabled={!mounted}
            >
              {toggleLabel}
            </Button>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Your <span className="text-primary">React</span> App
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Toggle between light and dark themes to preview how the assistant UI adapts to your brand colors.
            </p>
          </div>
        </main>
      </AssistantSidebar>
    </AssistantRuntimeProvider>
  );
}
