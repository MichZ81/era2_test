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
          ? "min-h-[164px] px-7 py-7"
          : "min-h-[168px] px-8 py-7",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center font-medium leading-none text-[var(--c-fg-mute)]",
          size === "compact" ? "gap-3 text-[26px]" : "gap-4 text-[22px]",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full",
            size === "compact" ? "size-4" : "size-3.5",
            dotClassName,
          )}
        />
        <span>{label}</span>
      </div>

      <div
        className={cn(
          "font-mono font-bold leading-none text-[var(--c-fg)] tabular-nums",
          size === "compact" ? "mt-7 text-[48px]" : "mt-8 text-[52px]",
        )}
      >
        {value}
      </div>
    </article>
  );
}
