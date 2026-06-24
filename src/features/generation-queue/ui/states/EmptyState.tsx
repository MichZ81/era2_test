import { Inbox } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export interface EmptyStateProps {
  /** Режим пустоты: нет задач вообще или нет совпадений после фильтров. */
  variant?: "empty" | "filtered";

  /** Дополнительные классы для размещения состояния в списке. */
  className?: string;
}

/** Пустое состояние очереди или результата фильтрации. */
export function EmptyState({ variant = "empty", className }: EmptyStateProps) {
  const title =
    variant === "filtered" ? "Ничего не найдено" : "Очередь пока пуста";
  const description =
    variant === "filtered"
      ? "Измените фильтр, сортировку или поисковый запрос."
      : "Новые генерации появятся здесь сразу после запуска.";

  return (
    <section
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--c-line)] bg-[var(--c-bg)] px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-[22px] bg-[rgba(232,84,32,0.12)] text-[var(--c-accent-2)]">
        <Inbox className="size-7" />
      </div>

      <h3 className="mt-6 text-[26px] font-semibold leading-tight text-[var(--c-fg)]">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-base leading-7 text-[var(--c-fg-mute)]">
        {description}
      </p>
    </section>
  );
}
