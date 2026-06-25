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

export interface TaskCardProps {
  /** Задача генерации, которую нужно отобразить в мобильной карточке. */
  task: GenerationTask;

  /** Позиция queued-задачи в очереди, вычисляется селектором и не хранится в домене. */
  queuePosition?: number | null;

  /** Дополнительный className для списков, анимаций или виртуализации. */
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

/** Мобильная карточка задачи генерации по макету Queue / Mobile. */
export function TaskCard({
  task,
  queuePosition,
  className,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
}: TaskCardProps) {
  const TypeIcon = TYPE_ICON[task.type];
  const isRunning = task.status === TASK_STATUS.running;
  const nowMs = useCurrentTime(isTaskTimeLive(task.status));
  const progressLabel = `${Math.round(task.progress)}%`;
  const metaItems = [
    formatTaskTime(task, nowMs),
    formatCredits(task.credits),
    queuePosition ? `#${queuePosition}` : null,
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "box-border flex w-full flex-none flex-col items-start gap-3 self-stretch rounded-[16px] border bg-[#141110] p-[14px] transition-colors",
        isRunning
          ? "border-[rgba(232,84,32,0.35)]"
          : "border-[#2D2420]",
        className,
      )}
    >
      <div className="flex w-full flex-none flex-row items-start gap-3">
        <TaskIcon className="size-12 overflow-hidden text-[var(--c-accent-2)]">
          {task.previewUrl ? (
            <img
              alt=""
              className="size-full object-cover"
              loading="lazy"
              src={task.previewUrl}
            />
          ) : (
            <TypeIcon className="size-[18px]" strokeWidth={2.3} />
          )}
        </TaskIcon>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <h3 className="line-clamp-2 w-full text-[15px] font-medium leading-5 text-[#F6EFE9]">
            {task.prompt}
          </h3>

          <div className="flex h-[22px] w-full flex-none flex-row flex-wrap items-center content-start gap-x-2 gap-y-1">
            <span className="flex h-[22px] max-w-full flex-none items-center gap-1.5 rounded-full bg-[#1A1514] px-2 py-[3px] font-mono text-[12px] font-normal leading-4 text-[#C8BEB6]">
              <span className="size-1.5 shrink-0 rounded-full bg-[#E85420]" />
              <span className="truncate">
                {task.model.name}
                {task.model.version ? ` ${task.model.version}` : ""}
              </span>
            </span>
            <span className="truncate text-[12px] font-normal leading-4 text-[#8A7F78]">
              {metaItems.join(" · ")}
            </span>
          </div>
        </div>
      </div>

      {isRunning && (
        <ProgressBar
          className="h-[5px] w-full flex-none bg-[#221C19]"
          indicatorClassName="bg-[linear-gradient(135deg,#E85421_0%,#FF7A3D_70.72%)] shadow-none"
          isActive
          value={task.progress}
        />
      )}

      <div className="flex h-[34px] w-full flex-none items-center justify-between">
        <div className="flex h-[26px] flex-none items-center gap-2">
          <StatusBadge
            className={getTaskCardStatusClassName(task.status)}
            status={task.status}
          />
          {isRunning && (
            <span
              className={cn(
                "w-6 flex-none font-mono text-[13px] font-medium leading-[17px] tabular-nums",
                isRunning
                  ? "text-[var(--c-accent-2)]"
                  : "text-[var(--c-fg-mute)]",
              )}
            >
              {progressLabel}
            </span>
          )}
        </div>

        <TaskActions
          onCancel={onCancel}
          onDelete={onDelete}
          onDownload={onDownload}
          onRetry={onRetry}
          status={task.status}
          taskId={task.id}
          variant="taskCard"
        />
      </div>
    </article>
  );
}

/** Иконка типа генерации для мобильного превью карточки. */
const TYPE_ICON: Record<GenType, typeof FileText> = {
  text: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
};

function getTaskCardStatusClassName(status: TaskStatus) {
  if (status === TASK_STATUS.queued) {
    return "w-[82px] bg-[#1A1514] text-[#8A7F78]";
  }

  if (status === TASK_STATUS.done) {
    return "w-[61px] bg-[rgba(16,185,129,0.133333)] text-[#34D399]";
  }

  if (status === TASK_STATUS.failed) {
    return "w-[67px] bg-[rgba(255,90,90,0.121569)] text-[#FF6B6B]";
  }

  return "w-[51px] bg-[#3A1A0A] text-[#FF7A3D]";
}
