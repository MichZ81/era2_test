import { cn } from "@/shared/lib/utils";

export interface MetricCardProps {
  /** Подпись метрики. */
  label: string;

  /** Числовое или текстовое значение метрики. */
  value: number | string;

  /** Цветовая утилита для точки статуса. */
  dotClassName: string;

  /** Размер карточки под desktop/tablet или мобильный вид. */
  size?: "default" | "compact";

  /** Дополнительные классы для адаптации карточки под конкретный блок. */
  className?: string;
}

/** Карточка метрики с цветной точкой, подписью и крупным значением. */
export function MetricCard({
  label,
  value,
  dotClassName,
  size = "default",
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-[26px] border border-[var(--c-line)] bg-[var(--c-bg)]",
        size === "compact"
          ? "min-h-[82px] rounded-[16px] px-4 py-3.5 sm:min-h-[164px] sm:rounded-[26px] sm:px-7 sm:py-7"
          : "min-h-[168px] px-8 py-7",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center whitespace-nowrap font-medium leading-none text-[var(--c-fg-mute)]",
          size === "compact"
            ? "gap-2 text-[13px] sm:gap-3 sm:text-[26px]"
            : "gap-4 text-[22px]",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full",
            size === "compact" ? "size-2 sm:size-4" : "size-3.5",
            dotClassName,
          )}
        />
        <span>{label}</span>
      </div>

      <div
        className={cn(
          "font-mono font-bold leading-none text-[var(--c-fg)] tabular-nums",
          size === "compact"
            ? "mt-4 text-[24px] sm:mt-7 sm:text-[48px]"
            : "mt-8 text-[52px]",
        )}
      >
        {value}
      </div>
    </article>
  );
}
