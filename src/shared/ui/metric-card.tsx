import { cn } from "@/shared/lib/cn";

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
          ? "h-[93px] rounded-[16px] px-4 py-3.5 sm:rounded-[26px] sm:px-6 sm:py-3.5"
          : "h-[93px] px-6 py-3.5",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center whitespace-nowrap font-medium leading-none text-[var(--c-fg-mute)]",
          size === "compact" ? "gap-2 text-[13px] sm:gap-3" : "gap-3 text-[13px]",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full",
            size === "compact" ? "size-2 sm:size-2.5" : "size-2.5",
            dotClassName,
          )}
        />
        <span>{label}</span>
      </div>

      <div
        className={cn(
          "font-mono font-bold leading-none text-[var(--c-fg)] tabular-nums",
          size === "compact" ? "mt-2.5 text-[24px] sm:mt-2.5" : "mt-2.5 text-[28px]",
        )}
      >
        {value}
      </div>
    </article>
  );
}
