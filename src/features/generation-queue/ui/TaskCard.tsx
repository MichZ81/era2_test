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
  const progressLabel = `${Math.round(task.progress)}%`;
  const metaItems = [
    formatEta(task.estimatedDurationSec),
    formatCredits(task.credits),
    queuePosition ? `#${queuePosition}` : null,
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "rounded-[28px] border bg-[var(--c-bg)] p-7 transition-colors",
        isRunning
          ? "border-[rgba(232,84,32,0.7)] shadow-[0_0_0_1px_rgba(232,84,32,0.16)]"
          : "border-[var(--c-line)]",
        className,
      )}
    >
      <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-6">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-[24px] bg-[var(--c-bg-1)] ring-1 ring-white/[0.03]">
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

        <div className="min-w-0 pt-1">
          <h3 className="line-clamp-2 text-[28px] font-semibold leading-[1.18] text-[var(--c-fg)]">
            {task.prompt}
          </h3>

          <div className="mt-5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-[22px] leading-none text-[var(--c-fg-mute)]">
            <span className="flex max-w-full items-center gap-3 rounded-full bg-[var(--c-bg-1)] px-4 py-2 font-mono text-[20px] ring-1 ring-white/[0.03]">
              <span className="size-3 shrink-0 rounded-full bg-[var(--c-accent)]" />
              <span className="truncate">
                {task.model.name}
                {task.model.version ? ` ${task.model.version}` : ""}
              </span>
            </span>
            <span className="font-mono text-[var(--c-fg-mute)]">
              {metaItems.join(" · ")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ProgressBar isActive={isRunning} value={task.progress} />
        {task.status === TASK_STATUS.failed && task.error && (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-red-300">
            {task.error.message}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <StatusBadge className="h-[52px] min-w-[102px]" status={task.status} />
          <span
            className={cn(
              "font-mono text-[24px] font-semibold tabular-nums",
              isRunning
                ? "text-[var(--c-accent-2)]"
                : "text-[var(--c-fg-mute)]",
            )}
          >
            {progressLabel}
          </span>
        </div>

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

/** Иконка типа генерации для мобильного превью карточки. */
const TYPE_ICON: Record<GenType, typeof FileText> = {
  text: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
};
