import { FileText, ImageIcon, Music, Video } from "lucide-react";

import {
  TASK_STATUS,
  type GenerationTask,
  type GenerationTaskId,
  type GenType,
  type TaskStatus,
} from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { TaskIcon } from "@/shared/ui/task-icon";

import { formatCredits } from "../lib/formatEta";
import { formatTaskTime, isTaskTimeLive } from "../lib/formatTaskTime";
import { useCurrentTime } from "../lib/useCurrentTime";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";

export interface TaskRowProps {
  /** Задача генерации, которую нужно отобразить в desktop/tablet строке. */
  task: GenerationTask;

  /** Позиция queued-задачи в очереди, вычисляется селектором и не хранится в домене. */
  queuePosition?: number | null;

  /** Дополнительный className для списка или виртуализированного контейнера. */
  className?: string;

  /** Отмена queued/running задачи. */
  onCancel?: (id: GenerationTaskId) => void;

  /** Повтор failed/canceled задачи. */
  onRetry?: (id: GenerationTaskId) => void;

  /** Заглушка скачивания done-задачи. */
  onDownload?: (id: GenerationTaskId) => void;

  /** Удаление задачи через меню дополнительных действий. */
  onDelete?: (id: GenerationTaskId) => void;
}

/** Desktop/tablet строка задачи генерации по макету Queue. */
export function TaskRow({
  task,
  queuePosition,
  className,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
}: TaskRowProps) {
  const TypeIcon = TYPE_ICON[task.type];
  const isRunning = task.status === TASK_STATUS.running;
  const nowMs = useCurrentTime(isTaskTimeLive(task.status));
  const progressLabel = `${Math.round(task.progress)}%`;
  const metaItems = [
    formatTaskTime(task, nowMs),
    formatCredits(task.credits),
    queuePosition ? `#${queuePosition} в очереди` : null,
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "group box-border flex h-[89px] w-full flex-none flex-row items-center gap-4 self-stretch rounded-[16px] border bg-[#141110] px-4 py-[14px] transition-colors",
        isRunning
          ? "border-[rgba(232,84,32,0.35)]"
          : "border-[rgba(232,84,32,0.35)] hover:border-[rgba(232,84,32,0.5)]",
        className,
      )}
    >
      <TaskIcon className="overflow-hidden text-[var(--c-accent-2)]">
        {task.previewUrl ? (
          <img
            alt=""
            className="size-full object-cover"
            loading="lazy"
            src={task.previewUrl}
          />
        ) : (
          <TypeIcon className="size-5" strokeWidth={2.3} />
        )}
      </TaskIcon>

      <div className="min-w-0 flex-[1_1_831px] self-stretch">
        <div className="flex h-[61px] min-w-0 flex-col items-start gap-[7px]">
          <h3 className="h-5 w-full flex-none truncate text-[15px] font-medium leading-5 text-[#F6EFE9]">
            {task.prompt}
          </h3>

          <div className="flex h-[22px] w-full flex-none items-center gap-2 text-[12px] leading-4">
            <span className="flex h-[22px] w-[122px] flex-none items-center gap-1.5 rounded-full bg-[#1A1514] px-2 py-[3px] font-mono text-[12px] font-normal leading-4 text-[#C8BEB6]">
              <span className="size-1.5 flex-none rounded-full bg-[#E85420]" />
              <span className="truncate">
                {task.model.name}
                {task.model.version ? ` ${task.model.version}` : ""}
              </span>
            </span>
            <span className="flex-none text-[12px] font-normal leading-4 text-[#5A504A]">
              ·
            </span>
            <span className="truncate text-[12px] font-normal leading-4 text-[#8A7F78]">
              {metaItems.join(" · ")}
            </span>
          </div>

          {isRunning ? (
            <ProgressBar
              className="h-[5px] w-full flex-none bg-[#221C19]"
              indicatorClassName="bg-[linear-gradient(135deg,#E85421_0%,#FF7A3D_70.72%)] shadow-none"
              isActive
              value={task.progress}
            />
          ) : (
            <div className="h-[5px] w-full flex-none" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="ml-auto flex h-[32px] w-[200px] flex-none items-center justify-end gap-3 whitespace-nowrap">
        {isRunning && (
          <span className="w-6 flex-none text-right font-mono text-[13px] font-medium leading-[17px] tabular-nums text-[var(--c-accent-2)]">
            {progressLabel}
          </span>
        )}
        <StatusBadge
          className={getTaskRowStatusClassName(task.status)}
          status={task.status}
        />
        <TaskActions
          onCancel={onCancel}
          onDelete={onDelete}
          onDownload={onDownload}
          onRetry={onRetry}
          status={task.status}
          taskId={task.id}
          variant="taskRow"
        />
      </div>
    </article>
  );
}

/** Иконка типа генерации для левого превью строки. */
const TYPE_ICON: Record<GenType, typeof FileText> = {
  text: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
};

function getTaskRowStatusClassName(status: TaskStatus) {
  if (status === TASK_STATUS.queued) {
    return "w-[82px]";
  }

  if (status === TASK_STATUS.canceled) {
    return "w-[86px]";
  }

  return undefined;
}
