import { useCallback, useEffect, useMemo, useState } from "react";

import {
  TASK_STATUS,
  type GenerationTask,
} from "@/entities/generation-task";
import { cn } from "@/shared/lib/cn";

import { useQueue } from "../model/useQueue";
import { GenerationQueueCollapsedStatus } from "./GenerationQueueCollapsedStatus";
import { GenerationQueueMultipleStatus } from "./GenerationQueueMultipleStatus";
import { GenerationQueueSingleStatus } from "./GenerationQueueSingleStatus";

/** Глобальный статус-бар активных генераций поверх любого экрана. */
export function GenerationQueueStatusBar() {
  const { activeTasks, stats, state } = useQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isReady = state.loadStatus === "ready";
  const previewTasks = useMemo(
    () => getPreviewTasks(activeTasks),
    [activeTasks],
  );
  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);
  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  useEffect(() => {
    if (activeTasks.length === 0) {
      setIsCollapsed(false);
    }
  }, [activeTasks.length]);

  if (!isReady || activeTasks.length === 0) {
    return null;
  }

  const averageProgress = stats.averageActiveProgress;

  return (
    <aside
      aria-label="Активные генерации"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[80] px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:bottom-6 sm:left-auto sm:right-6 sm:w-[332px] sm:p-0",
      )}
    >
      {isCollapsed ? (
        <GenerationQueueCollapsedStatus
          averageProgress={averageProgress}
          onExpand={handleExpand}
          totalActive={activeTasks.length}
        />
      ) : activeTasks.length === 1 ? (
        <GenerationQueueSingleStatus
          onCollapse={handleCollapse}
          task={activeTasks[0]}
        />
      ) : (
        <GenerationQueueMultipleStatus
          averageProgress={averageProgress}
          onCollapse={handleCollapse}
          previewTasks={previewTasks}
          totalActive={activeTasks.length}
        />
      )}
    </aside>
  );
}

/** Берет 2-3 активные задачи: running выше queued, затем FIFO по createdAt. */
function getPreviewTasks(tasks: readonly GenerationTask[]) {
  return [...tasks]
    .sort(compareStatusBarTasks)
    .slice(0, 3);
}

/** Сортирует активные задачи для мини-списка статус-бара. */
function compareStatusBarTasks(left: GenerationTask, right: GenerationTask) {
  const statusDiff = getActiveStatusOrder(left) - getActiveStatusOrder(right);

  if (statusDiff !== 0) {
    return statusDiff;
  }

  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

function getActiveStatusOrder(task: GenerationTask) {
  return task.status === TASK_STATUS.running ? 0 : 1;
}
