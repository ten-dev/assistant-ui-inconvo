"use client";

import { useEffect, useMemo, useRef, useState, type FC } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const MAX_VISIBLE_THREADS = 3;

export const AssistantThreadList: FC = () => {
  const threadIds = useAssistantState(({ threads }) => threads.threadIds);
  const isLoading = useAssistantState(({ threads }) => threads.isLoading);
  const threadItems = useAssistantState(({ threads }) => threads.threadItems);
  const mainThreadId = useAssistantState(({ threads }) => threads.mainThreadId);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>();

  useEffect(() => {
    const element = sidebarRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setPopoverWidth(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const threadCount = threadIds.length;
  const visibleCount = Math.min(threadCount, MAX_VISIBLE_THREADS);
  const currentThread = useMemo(
    () => threadItems.find((item) => item.id === mainThreadId),
    [threadItems, mainThreadId]
  );
  const currentTitle = currentThread?.title ?? "Untitled conversation";
  const showCompact = currentThread?.status !== "new" && threadCount > 0;
  const filteredCount = useMemo(() => {
    if (!searchTerm) return threadItems.length;
    const term = searchTerm.toLowerCase();
    return threadItems.filter((item) =>
      (item.title ?? "Untitled conversation").toLowerCase().includes(term)
    ).length;
  }, [searchTerm, threadItems]);

  const visibleIndexes = useMemo(() => {
    return Array.from({ length: visibleCount }, (_, index) => index);
  }, [visibleCount]);

  const threadListComponents = useMemo(
    () => ({
      ThreadListItem: ThreadListRow,
    }),
    []
  );

  const historyComponents = useMemo(() => {
    const FilteredRow: FC = () => (
      <ThreadHistoryRow
        filter={searchTerm}
        onSelect={() => setHistoryOpen(false)}
      />
    );
    return { ThreadListItem: FilteredRow };
  }, [searchTerm]);

  return (
    <ThreadListPrimitive.Root
      ref={sidebarRef}
      className={`aui-thread-list flex flex-col rounded-2xl border border-border/30 bg-background/50 shadow-sm ${
        showCompact ? "gap-2 p-2" : "gap-3 p-3"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-2 ${
          showCompact ? "" : "border-b border-border/40 pb-2"
        }`}
      >
        <div className="flex flex-col">
          {showCompact ? (
            <span className="truncate text-sm font-semibold text-foreground">
              {currentTitle}
            </span>
          ) : (
            <>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Threads
              </span>
              <span className="text-base font-semibold">
                Recent conversations
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
            <PopoverTrigger asChild>
              <TooltipIconButton
                tooltip="Search history"
                aria-label="Search history"
                className="border border-transparent text-muted-foreground transition"
              >
                <Clock4Icon className="size-4" />
              </TooltipIconButton>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="border border-border/30 p-0"
              style={{
                width: popoverWidth! + 50,
              }}
            >
              <div className="flex flex-col gap-2 p-3">
                <div className="rounded-2xl border border-border/30 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  <input
                    type="text"
                    placeholder="Search recent threads"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto rounded-2xl border border-border/20 bg-background/90">
                  {threadCount === 0 ? (
                    <EmptyState />
                  ) : filteredCount === 0 ? (
                    <EmptySearchState />
                  ) : (
                    <ThreadListPrimitive.Items components={historyComponents} />
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <NewThreadButton />
        </div>
      </div>

      {!showCompact && (
        <>
          {isLoading ? (
            <ThreadListSkeleton />
          ) : threadCount === 0 ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-1">
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
            <Button
              type="button"
              variant="link"
              className="px-0 text-sm"
              onClick={() => setHistoryOpen(true)}
              disabled={threadCount === 0}
            >
              {`View all (${threadCount})`}
            </Button>
          </div>
        </>
      )}
    </ThreadListPrimitive.Root>
  );
};

const ThreadListRow: FC = () => {
  return (
    <li>
      <ThreadListItemPrimitive.Root className="group/thread-item block w-full rounded-xl transition hover:bg-muted/60 data-[active=true]:bg-primary/10">
        <ThreadListItemPrimitive.Trigger className="flex w-full items-center gap-3 px-2 py-1.5 text-left text-sm">
          <div className="flex flex-1 overflow-hidden">
            <span className="truncate font-medium">
              <ThreadListItemPrimitive.Title fallback="Untitled conversation" />
            </span>
          </div>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover/thread-item:opacity-100 group-data-[active=true]/thread-item:text-primary group-data-[active=true]/thread-item:opacity-100" />
        </ThreadListItemPrimitive.Trigger>
      </ThreadListItemPrimitive.Root>
    </li>
  );
};

type ThreadHistoryRowProps = {
  filter: string;
  onSelect?: () => void;
};

const ThreadHistoryRow: FC<ThreadHistoryRowProps> = ({ filter, onSelect }) => {
  const title = useAssistantState(
    ({ threadListItem }) => threadListItem.title ?? "Untitled conversation"
  );

  if (filter && !title.toLowerCase().includes(filter.toLowerCase())) {
    return null;
  }

  return (
    <ThreadListItemPrimitive.Root className="group/history-item block w-full border-b border-border/20 last:border-b-0">
      <ThreadListItemPrimitive.Trigger
        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-muted/50"
        onClick={onSelect}
      >
        <span className="truncate font-medium">{title}</span>
      </ThreadListItemPrimitive.Trigger>
    </ThreadListItemPrimitive.Root>
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

const EmptySearchState: FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
      <SparklesIcon className="size-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No matching threads</p>
    </div>
  );
};

const ThreadListSkeleton: FC = () => {
  return (
    <ul className="flex flex-col gap-1">
      {Array.from({ length: MAX_VISIBLE_THREADS }).map((_, index) => (
        <li key={index} className="h-8 animate-pulse rounded-xl bg-muted/60" />
      ))}
    </ul>
  );
};

const NewThreadButton: FC = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ThreadListPrimitive.New
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border/30 text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Start new chat"
        >
          <PlusIcon className="size-4" />
        </ThreadListPrimitive.New>
      </TooltipTrigger>
      <TooltipContent>New chat</TooltipContent>
    </Tooltip>
  );
};
