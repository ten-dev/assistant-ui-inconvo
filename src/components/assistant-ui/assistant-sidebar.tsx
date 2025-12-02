import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { ComponentProps, FC, PropsWithChildren } from "react";

import { Thread } from "~/components/assistant-ui/thread";
import { AssistantThreadList } from "~/components/assistant-ui/thread-list";

type PanelProps = Omit<ComponentProps<typeof ResizablePanel>, "children">;
type PanelGroupProps = Omit<
  ComponentProps<typeof ResizablePanelGroup>,
  "children"
>;

type AssistantSidebarProps = PropsWithChildren<{
  mainPanelProps?: PanelProps;
  threadPanelProps?: PanelProps;
  panelGroupProps?: PanelGroupProps;
}>;

export const AssistantSidebar: FC<AssistantSidebarProps> = ({
  children,
  mainPanelProps,
  threadPanelProps,
  panelGroupProps,
}) => {
  const { direction, ...groupProps } = panelGroupProps ?? {};

  return (
    <ResizablePanelGroup direction={direction ?? "horizontal"} {...groupProps}>
      <ResizablePanel {...mainPanelProps}>{children}</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel {...threadPanelProps}>
        <div className="flex h-full flex-col gap-4 bg-background/80 p-4">
          <AssistantThreadList />
          <div className="flex-1 overflow-hidden rounded-3xl border border-border/40 bg-background/80">
            <Thread />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
