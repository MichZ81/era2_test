import {
  EmptyState,
  ErrorState,
  LoadingState,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  selectQueuedPosition,
  useQueue,
} from "@/features/generation-queue";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

/** Внутренняя композиция экрана очереди, которая читает данные из QueueProvider. */
export function GenerationQueueContent() {
  const {
    state,
    tasks,
    visibleTasks,
    stats,
    view,
    actions,
  } = useQueue();
  const isMobile = useIsMobile();
  const isInitialLoading = state.loadStatus === "idle" || state.loadStatus === "loading";
  const isEmptyQueue = state.loadStatus === "ready" && tasks.length === 0;
  const hasNoResults =
    state.loadStatus === "ready" && tasks.length > 0 && visibleTasks.length === 0;

  return (
    <section className="min-h-[calc(100vh-var(--header-height,64px))] bg-[var(--c-bg)] px-4 py-8 text-[var(--c-fg)] sm:px-8 lg:px-0 lg:py-12">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold leading-tight tracking-normal text-[var(--c-fg)] sm:text-[32px]">
              Очередь генераций
            </h1>
            <p className="mt-2 text-base leading-6 text-[var(--c-fg-mute)]">
              Все ваши задачи в реальном времени
            </p>
          </div>

          <Button
            className="h-10 self-start rounded-full border-[var(--c-line)] bg-transparent px-5 text-sm text-[var(--c-fg-dim)] hover:bg-white/[0.04] hover:text-[var(--c-fg)]"
            disabled={stats.done === 0}
            onClick={actions.clearDoneTasks}
            type="button"
            variant="outline"
          >
            Очистить готовые
          </Button>
        </header>

        {isInitialLoading ? (
          <LoadingState />
        ) : state.loadStatus === "error" ? (
          <ErrorState
            message={state.loadError}
            onRetry={actions.retryLoad}
          />
        ) : (
          <>
            <QueueStats
              cardSize={isMobile ? "compact" : "default"}
              stats={stats}
            />

            <QueueToolbar
              onSearchChange={view.setSearch}
              onSortChange={view.setSort}
              onStatusChange={view.setStatusFilter}
              onTypeChange={view.setTypeFilter}
              query={view.query}
            />

            {isEmptyQueue || hasNoResults ? (
              <EmptyState variant={hasNoResults ? "filtered" : "empty"} />
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {visibleTasks.map((task) => {
                  const queuePosition = selectQueuedPosition(tasks, task.id);

                  return (
                    <div key={task.id}>
                      <TaskCard
                        className="md:hidden"
                        onCancel={actions.cancelTask}
                        onDelete={actions.deleteTask}
                        onDownload={handleDownload}
                        onRetry={actions.retryTask}
                        queuePosition={queuePosition}
                        task={task}
                      />
                      <TaskRow
                        className={cn("hidden md:grid")}
                        onCancel={actions.cancelTask}
                        onDelete={actions.deleteTask}
                        onDownload={handleDownload}
                        onRetry={actions.retryTask}
                        queuePosition={queuePosition}
                        task={task}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** Заглушка скачивания результата, пока реального бэкенда нет. */
function handleDownload() {
  // Реальное скачивание появится вместе с backend/API.
}
