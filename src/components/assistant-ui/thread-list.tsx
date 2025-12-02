"use client";

import { useMemo, useState, type FC } from "react";
import {
  ThreadListPrimitive,
  ThreadListItemPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
import {
  Clock4Icon,
  ChevronRightIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";
import { cn } from "~/lib/utils";

const MAX_VISIBLE_THREADS = 3;

export const AssistantThreadList: FC = () => {
  const threadIds = useAssistantState(({ threads }) => threads.threadIds);
  const isLoading = useAssistantState(({ threads }) => threads.isLoading);

  const [showAll, setShowAll] = useState(false);
  const threadCount = threadIds.length;
  const canToggle = threadCount > MAX_VISIBLE_THREADS;
  const visibleCount = showAll ? threadCount : Math.min(threadCount, MAX_VISIBLE_THREADS);

  const visibleIndexes = useMemo(() => {
    return Array.from({ length: visibleCount }, (_, index) => index);
  }, [visibleCount]);

  const threadListComponents = useMemo(
    () => ({
      ThreadListItem: ThreadListRow,
    }),
    [],
  );

  const toggleHistory = () => {
    if (!canToggle) return;
    setShowAll((prev) => !prev);
  };

  return (
    <ThreadListPrimitive.Root className="aui-thread-list flex flex-col gap-4 rounded-3xl border border-border/40 bg-background/60 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Threads
          </span>
          <span className="text-base font-semibold">Recent conversations</span>
        </div>
        <div className="flex items-center gap-2">
          <TooltipIconButton
            tooltip={showAll ? "Show less" : "View entire history"}
            aria-pressed={showAll}
            aria-label="Toggle history view"
            onClick={toggleHistory}
            disabled={!canToggle}
            className={cn(
              "border border-transparent text-muted-foreground transition",
              showAll && "bg-accent text-foreground",
            )}
          >
            <Clock4Icon className="size-4" />
          </TooltipIconButton>
          <NewThreadButton />
        </div>
      </div>

      {isLoading ? (
        <ThreadListSkeleton />
      ) : threadCount === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleIndexes.map((index) => (
            <ThreadListPrimitive.ItemByIndex
              key={index}
              index={index}
              components={threadListComponents}
            />
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {threadCount} total thread{threadCount === 1 ? "" : "s"}
        </span>
        <Button
          type="button"
          variant="link"
          className="px-0 text-sm"
          onClick={toggleHistory}
          disabled={!canToggle}
        >
          {showAll ? "Show less" : `View all (${threadCount})`}
        </Button>
      </div>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListRow: FC = () => {
  const status = useAssistantState(({ threadListItem }) => threadListItem.status);

  return (
    <li>
      <ThreadListItemPrimitive.Root className="group/thread-item block w-full rounded-2xl border border-border/40 bg-card/70 transition hover:border-border hover:bg-card/90">
        <ThreadListItemPrimitive.Trigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium">
          <div className="flex flex-col gap-1">
            <ThreadListItemPrimitive.Title fallback="Untitled conversation" />
            <span className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
              {statusLabel(status)}
            </span>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground transition group-data-[active=true]/thread-item:text-primary group-hover/thread-item:text-foreground" />
        </ThreadListItemPrimitive.Trigger>
      </ThreadListItemPrimitive.Root>
    </li>
  );
};

const EmptyState: FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/40 px-4 py-6 text-center">
      <SparklesIcon className="size-5 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium">No threads yet</p>
        <p className="text-xs text-muted-foreground">
          Start a new chat to see it appear in your history.
        </p>
      </div>
    </div>
  );
};

const ThreadListSkeleton: FC = () => {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: MAX_VISIBLE_THREADS }).map((_, index) => (
        <li
          key={index}
          className="h-14 animate-pulse rounded-2xl border border-border/40 bg-muted/40"
        />
      ))}
    </ul>
  );
};

const NewThreadButton: FC = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ThreadListPrimitive.New
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-transparent bg-primary/10 text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Start new chat"
        >
          <PlusIcon className="size-4" />
        </ThreadListPrimitive.New>
      </TooltipTrigger>
      <TooltipContent>New chat</TooltipContent>
    </Tooltip>
  );
};

const statusLabel = (status: string | undefined) => {
  switch (status) {
    case "archived":
      return "Archived";
    case "new":
      return "Draft";
    case "deleted":
      return "Deleted";
    default:
      return "Active";
  }
};
