import { cn } from "@/shared/lib/utils";
import { MetricCard } from "@/shared/ui/metric-card";

import type { QueueStats as QueueStatsModel } from "../model/selectors";

export interface QueueStatsProps {
  /** Счетчики очереди, рассчитанные селектором. */
  stats: QueueStatsModel;

  /** Размер карточек: default для desktop/tablet, compact для мобильной сетки. */
  cardSize?: "default" | "compact";

  /** Сетка блока: adaptive меняет 2x2 на 4 колонки, desktop всегда держит одну строку. */
  layout?: "adaptive" | "desktop";

  /** Дополнительные классы для размещения блока в виджете. */
  className?: string;
}

/** Конфигурация четырех карточек статусов из макета. */
const STAT_CARDS: Array<{
  key: keyof Pick<QueueStatsModel, "queued" | "running" | "done" | "failed">;
  label: string;
  dotClassName: string;
}> = [
  {
    key: "queued",
    label: "В очереди",
    dotClassName: "bg-[var(--c-fg-mute)]",
  },
  {
    key: "running",
    label: "Идет",
    dotClassName: "bg-[var(--c-accent)]",
  },
  {
    key: "done",
    label: "Готово",
    dotClassName: "bg-emerald-400",
  },
  {
    key: "failed",
    label: "Ошибка",
    dotClassName: "bg-red-400",
  },
];

/** Блок из четырех счетчиков статусов очереди генераций. */
export function QueueStats({
  stats,
  cardSize = "default",
  layout = "adaptive",
  className,
}: QueueStatsProps) {
  return (
    <section
      aria-label="Сводка по очереди генераций"
      className={cn(
        "grid gap-3 lg:gap-5",
        layout === "adaptive"
          ? "grid-cols-2 md:grid-cols-[repeat(4,167px)] md:justify-between lg:grid-cols-4"
          : "grid-cols-4",
        className,
      )}
    >
      {STAT_CARDS.map((card) => (
        <MetricCard
          dotClassName={card.dotClassName}
          key={card.key}
          label={card.label}
          size={cardSize}
          value={stats[card.key]}
        />
      ))}
    </section>
  );
}
