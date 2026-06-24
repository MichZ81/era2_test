import { FileText, ImageIcon, Music, Video } from "lucide-react";

import {
  TASK_STATUS,
  type GenerationTask,
  type GenerationTaskId,
  type GenType,
} from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

import { formatCredits, formatEta } from "../lib/formatEta";
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
  const progressLabel = `${Math.round(task.progress)}%`;
  const metaItems = [
    formatEta(task.estimatedDurationSec),
    formatCredits(task.credits),
    queuePosition ? `#${queuePosition} в очереди` : null,
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "group grid min-h-[164px] grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-7 rounded-[30px] border bg-[var(--c-bg)] px-7 py-6 transition-colors",
        isRunning
          ? "border-[rgba(232,84,32,0.65)] shadow-[0_0_0_1px_rgba(232,84,32,0.16)]"
          : "border-[var(--c-line)] hover:border-[var(--c-line-2)]",
        className,
      )}
    >
      <div className="flex size-[104px] items-center justify-center overflow-hidden rounded-[24px] bg-[var(--c-bg-1)] ring-1 ring-white/[0.03]">
        {task.previewUrl ? (
          <img
            alt=""
            className="size-full object-cover"
            loading="lazy"
            src={task.previewUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(232,84,32,0.22),transparent_36%),linear-gradient(135deg,var(--c-bg-2),var(--c-bg))] text-[var(--c-accent-2)]">
            <TypeIcon className="size-8" strokeWidth={2.3} />
          </div>
        )}
      </div>

      <div className="min-w-0 self-stretch">
        <div className="flex h-full min-w-0 flex-col justify-between gap-5">
          <div className="min-w-0">
            <h3 className="truncate text-[27px] font-semibold leading-[1.15] text-[var(--c-fg)]">
              {task.prompt}
            </h3>

            <div className="mt-4 flex min-w-0 items-center gap-3 text-[22px] leading-none text-[var(--c-fg-mute)]">
              <span className="flex min-w-0 items-center gap-3 rounded-full bg-[var(--c-bg-1)] px-4 py-2 font-mono text-[20px] ring-1 ring-white/[0.03]">
                <span className="size-3 rounded-full bg-[var(--c-accent)]" />
                <span className="truncate">
                  {task.model.name}
                  {task.model.version ? ` ${task.model.version}` : ""}
                </span>
              </span>
              <span className="text-[var(--c-fg-low)]">·</span>
              <span className="truncate font-mono">
                {metaItems.join(" · ")}
              </span>
            </div>
          </div>

          <div>
            <ProgressBar
              className="max-w-[1520px]"
              isActive={isRunning}
              value={task.progress}
            />
            {task.status === TASK_STATUS.failed && task.error && (
              <p className="mt-2 truncate text-sm text-red-300">
                {task.error.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 self-start pt-4">
        <span
          className={cn(
            "min-w-16 text-right font-mono text-[22px] font-semibold tabular-nums",
            isRunning ? "text-[var(--c-accent-2)]" : "text-[var(--c-fg-mute)]",
          )}
        >
          {progressLabel}
        </span>
        <StatusBadge status={task.status} />
        <TaskActions
          onCancel={onCancel}
          onDelete={onDelete}
          onDownload={onDownload}
          onRetry={onRetry}
          status={task.status}
          taskId={task.id}
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
