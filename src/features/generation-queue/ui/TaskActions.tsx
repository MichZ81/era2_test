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
}

/** Кнопки действий строки: главное действие по статусу и меню с удалением. */
export function TaskActions({
  taskId,
  status,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
}: TaskActionsProps) {
  const primaryAction = getPrimaryAction(status);

  return (
    <div className="flex items-center gap-2">
      {primaryAction === "cancel" && (
        <Button
          aria-label="Отменить задачу"
          className="h-14 w-14 rounded-[14px] border-[var(--c-line)] bg-transparent text-[var(--c-fg-mute)] hover:bg-white/[0.04] hover:text-[var(--c-fg)]"
          onClick={() => onCancel?.(taskId)}
          size="icon"
          type="button"
          variant="outline"
        >
          <X className="size-6" />
        </Button>
      )}

      {primaryAction === "retry" && (
        <Button
          aria-label="Повторить задачу"
          className="h-14 w-14 rounded-[14px]"
          onClick={() => onRetry?.(taskId)}
          size="icon"
          type="button"
          variant="outline"
        >
          <RotateCcw className="size-5" />
        </Button>
      )}

      {primaryAction === "download" && (
        <Button
          aria-label="Скачать результат"
          className="h-14 w-14 rounded-[14px]"
          onClick={() => onDownload?.(taskId)}
          size="icon"
          type="button"
          variant="outline"
        >
          <Download className="size-5" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Открыть меню задачи"
            className="h-14 w-14 rounded-[14px] border-[var(--c-line)] bg-transparent text-[var(--c-fg-mute)] hover:bg-white/[0.04] hover:text-[var(--c-fg)]"
            size="icon"
            type="button"
            variant="outline"
          >
            <MoreHorizontal className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem
            className="text-red-300 focus:text-red-200"
            onClick={() => onDelete?.(taskId)}
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
