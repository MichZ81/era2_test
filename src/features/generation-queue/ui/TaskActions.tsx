import { useCallback } from "react";
import {
  Download,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import {
  TASK_STATUS,
  type GenerationTaskId,
  type TaskStatus,
} from "@/entities/generation-task";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export interface TaskActionsProps {
  /** Идентификатор задачи, который передается во все callbacks. */
  taskId: GenerationTaskId;

  /** Статус определяет главное действие строки. */
  status: TaskStatus;

  /** Отмена queued/running задачи. */
  onCancel?: (id: GenerationTaskId) => void;

  /** Повтор failed/canceled задачи. */
  onRetry?: (id: GenerationTaskId) => void;

  /** Заглушка скачивания done-задачи. */
  onDownload?: (id: GenerationTaskId) => void;

  /** Удаление задачи из меню дополнительных действий. */
  onDelete?: (id: GenerationTaskId) => void;

  /** Компактный режим для блока управления в строке или мобильной карточке. */
  variant?: "default" | "taskRow" | "taskCard";
}

/** Кнопки действий строки: главное действие по статусу и меню с удалением. */
export function TaskActions({
  taskId,
  status,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
  variant = "default",
}: TaskActionsProps) {
  const primaryAction = getPrimaryAction(status);
  const isTaskRowVariant = variant === "taskRow";
  const isTaskCardVariant = variant === "taskCard";
  const isCompactVariant = isTaskRowVariant || isTaskCardVariant;
  const neutralButtonClassName = isTaskRowVariant
    ? "h-[32px] w-[32px] flex-none rounded-[8px] border border-[#2D2420] bg-[#1A1514] p-0 text-[var(--c-fg-mute)] hover:border-[#3A302B] hover:bg-[#211B19] hover:text-[var(--c-fg)]"
    : isTaskCardVariant
      ? "h-[34px] w-[34px] flex-none rounded-[8px] border border-[#2D2420] bg-[#1A1514] p-0 text-[#8A7F78] hover:border-[#3A302B] hover:bg-[#211B19] hover:text-[#F6EFE9]"
    : "h-14 w-14 rounded-[14px] border-[var(--c-line)] bg-transparent text-[var(--c-fg-mute)] hover:bg-white/[0.04] hover:text-[var(--c-fg)]";
  const primaryButtonClassName = isCompactVariant
    ? `${neutralButtonClassName}${
        isTaskCardVariant && primaryAction !== "cancel"
          ? " text-[#FF7A3D] hover:text-[#FF7A3D]"
          : ""
      }`
    : "h-14 w-14 rounded-[14px]";
  const iconClassName = isCompactVariant ? "size-3.5" : "size-5";
  const largeIconClassName = isCompactVariant ? "size-3.5" : "size-6";
  const handleCancel = useCallback(() => {
    onCancel?.(taskId);
  }, [onCancel, taskId]);

  const handleRetry = useCallback(() => {
    onRetry?.(taskId);
  }, [onRetry, taskId]);

  const handleDownload = useCallback(() => {
    onDownload?.(taskId);
  }, [onDownload, taskId]);

  const handleDelete = useCallback(() => {
    onDelete?.(taskId);
  }, [onDelete, taskId]);

  return (
    <div
      className={
        isTaskRowVariant
          ? "order-2 flex h-[32px] w-[70px] flex-none items-start gap-1.5"
          : isTaskCardVariant
            ? "flex h-[34px] w-[74px] flex-none items-start gap-1.5"
            : "flex items-center gap-2"
      }
    >
      {primaryAction === "cancel" && (
        <Button
          aria-label="Отменить задачу"
          className={neutralButtonClassName}
          onClick={handleCancel}
          size="icon"
          type="button"
          variant="outline"
        >
          <X className={largeIconClassName} />
        </Button>
      )}

      {primaryAction === "retry" && (
        <Button
          aria-label="Повторить задачу"
          className={primaryButtonClassName}
          onClick={handleRetry}
          size="icon"
          type="button"
          variant="outline"
        >
          <RotateCcw className={iconClassName} />
        </Button>
      )}

      {primaryAction === "download" && (
        <Button
          aria-label="Скачать результат"
          className={primaryButtonClassName}
          onClick={handleDownload}
          size="icon"
          type="button"
          variant="outline"
        >
          <Download className={iconClassName} />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Открыть меню задачи"
            className={neutralButtonClassName}
            size="icon"
            type="button"
            variant="outline"
          >
            <MoreHorizontal className={largeIconClassName} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem
            className="text-red-300 focus:text-red-200"
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Определяет главное действие строки по конечному статусу задачи. */
function getPrimaryAction(status: TaskStatus) {
  if (status === TASK_STATUS.running || status === TASK_STATUS.queued) {
    return "cancel";
  }

  if (status === TASK_STATUS.failed || status === TASK_STATUS.canceled) {
    return "retry";
  }

  if (status === TASK_STATUS.done) {
    return "download";
  }

  return null;
}
