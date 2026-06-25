import { useCallback, useEffect, useMemo, useState } from "react";

import {
  TASK_STATUS,
  type GenerationTask,
  type TaskStatus,
} from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

import { useQueue } from "../model/useQueue";
import { GenerationQueueCollapsedStatus } from "./GenerationQueueCollapsedStatus";
import { GenerationQueueMultipleStatus } from "./GenerationQueueMultipleStatus";
import { GenerationQueueSingleStatus } from "./GenerationQueueSingleStatus";

/** Глобальный статус-бар активных генераций поверх любого экрана. */
export function GenerationQueueStatusBar() {
  const { activeTasks, stats, state, tasks } = useQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isReady = state.loadStatus === "ready";
  const previewTasks = useMemo(
    () => getPreviewTasks(tasks),
    [tasks],
  );
  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);
  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  useEffect(() => {
    if (tasks.length === 0) {
      setIsCollapsed(false);
    }
  }, [tasks.length]);

  if (!isReady || tasks.length === 0) {
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
      ) : tasks.length === 1 && activeTasks.length === 1 ? (
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

/** Сортирует задачи для мини-списка статус-бара: активные выше истории. */
function compareStatusBarTasks(left: GenerationTask, right: GenerationTask) {
  const statusDiff = STATUS_BAR_STATUS_ORDER[left.status] -
    STATUS_BAR_STATUS_ORDER[right.status];

  if (statusDiff !== 0) {
    return statusDiff;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

const STATUS_BAR_STATUS_ORDER: Record<TaskStatus, number> = {
  [TASK_STATUS.running]: 0,
  [TASK_STATUS.queued]: 1,
  [TASK_STATUS.failed]: 2,
  [TASK_STATUS.done]: 3,
  [TASK_STATUS.canceled]: 4,
};
