import { Separator, ResizablePanel, Group } from "~/components/ui/resizable";
import type { FC, PropsWithChildren } from "react";
import { AssistantThreadList } from "~/components/assistant-ui/thread-list";

import { Thread } from "~/components/assistant-ui/thread";

export const AssistantSidebar: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Group orientation="horizontal">
      <ResizablePanel>{children}</ResizablePanel>
      <Separator />
      <ResizablePanel>
        <div className="flex h-full flex-col gap-4 bg-background/80 p-4">
          <AssistantThreadList />
          <div className="flex-1 overflow-hidden rounded-3xl border border-border/40 bg-background/80">
            <Thread />
          </div>
        </div>
      </ResizablePanel>
    </Group>
  );
};
