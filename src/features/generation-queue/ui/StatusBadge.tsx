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
    className: "text-[var(--c-fg-mute)]",
  },
  [TASK_STATUS.running]: {
    label: "Идет",
    className: "text-[var(--c-accent-2)]",
  },
  [TASK_STATUS.done]: {
    label: "Готово",
    className: "text-emerald-300",
  },
  [TASK_STATUS.failed]: {
    label: "Ошибка",
    className: "text-red-300",
  },
  [TASK_STATUS.canceled]: {
    label: "Отменено",
    className: "text-[var(--c-fg-low)]",
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
        "order-1 box-border inline-flex h-[26px] w-[51px] flex-none flex-row items-center justify-center overflow-hidden whitespace-nowrap rounded-[8px] bg-[#3A1A0A] px-[10px] py-[5px] text-[12px] font-medium leading-4",
        view.className,
        className,
      )}
    >
      {view.label}
    </span>
  );
}
