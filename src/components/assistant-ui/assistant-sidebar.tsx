import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { ComponentProps, FC, PropsWithChildren } from "react";

import { Thread } from "~/components/assistant-ui/thread";

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
        <Thread />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
