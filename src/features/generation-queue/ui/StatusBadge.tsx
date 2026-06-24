import { TASK_STATUS, type TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

/** Визуальная конфигурация статусов из ТЗ: neutral/orange/green/red/muted. */
const STATUS_VIEW: Record<
  TaskStatus,
  {
    label: string;
    className: string;
  }
> = {
  [TASK_STATUS.queued]: {
    label: "В очереди",
    className: "bg-white/5 text-[var(--c-fg-mute)] ring-white/10",
  },
  [TASK_STATUS.running]: {
    label: "Идет",
    className:
      "bg-[rgba(232,84,32,0.22)] text-[var(--c-accent-2)] ring-[rgba(232,84,32,0.18)]",
  },
  [TASK_STATUS.done]: {
    label: "Готово",
    className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
  },
  [TASK_STATUS.failed]: {
    label: "Ошибка",
    className: "bg-red-500/15 text-red-300 ring-red-500/20",
  },
  [TASK_STATUS.canceled]: {
    label: "Отменено",
    className: "bg-white/[0.03] text-[var(--c-fg-low)] ring-white/10",
  },
};

export interface StatusBadgeProps {
  /** Текущий статус задачи генерации. */
  status: TaskStatus;

  /** Дополнительные классы для встраивания в строку или карточку. */
  className?: string;
}

/** Компактный бейдж статуса задачи генерации. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const view = STATUS_VIEW[status];

  return (
    <span
      className={cn(
        "inline-flex h-12 min-w-[94px] items-center justify-center rounded-[14px] px-4 text-[16px] font-semibold ring-1",
        view.className,
        className,
      )}
    >
      {view.label}
    </span>
  );
}
