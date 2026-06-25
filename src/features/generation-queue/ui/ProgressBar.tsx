import { cn } from "@/shared/lib/utils";

export interface ProgressBarProps {
  /** Значение прогресса в процентах. */
  value: number;

  /** Включает акцентный running-вид прогресса. */
  isActive?: boolean;

  /** Дополнительные классы для адаптации ширины/отступов. */
  className?: string;

  /** Дополнительные классы для заполненной части прогресса. */
  indicatorClassName?: string;
}

/** Горизонтальный progress bar для строки и будущей мобильной карточки задачи. */
export function ProgressBar({
  value,
  isActive,
  className,
  indicatorClassName,
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn(
        "h-2 overflow-hidden rounded-full bg-white/[0.04]",
        className,
      )}
      role="progressbar"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          isActive
            ? "bg-[var(--c-accent-2)] shadow-[0_0_20px_rgba(232,84,32,0.42)]"
            : "bg-white/20",
          indicatorClassName,
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
