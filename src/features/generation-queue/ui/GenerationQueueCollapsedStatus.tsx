import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { pluralizeGenerationCount } from "../lib/formatGenerationTaskLabel";
import { ProgressBar } from "./ProgressBar";

export interface GenerationQueueCollapsedStatusProps {
  /** Общее количество queued + running задач. */
  totalActive: number;

  /** Усредненный прогресс активных задач. */
  averageProgress: number;

  /** Разворачивает глобальный статус-бар. */
  onExpand: () => void;
}

/** Свернутая пилюля глобального статус-бара генераций. */
export function GenerationQueueCollapsedStatus({
  totalActive,
  averageProgress,
  onExpand,
}: GenerationQueueCollapsedStatusProps) {
  return (
    <button
      aria-label="Развернуть статус генераций"
      className={cn(
        "ml-auto flex w-full items-center gap-3 rounded-full border border-[var(--c-line)] bg-[var(--c-bg-1)] px-4 py-3 text-left text-[var(--c-fg)] shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 hover:border-[var(--c-line-2)] sm:w-auto sm:min-w-[260px]",
      )}
      onClick={onExpand}
      type="button"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--c-accent-soft)] text-[var(--c-accent-2)]">
        <Loader2 className="size-4 animate-spin" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {totalActive} {pluralizeGenerationCount(totalActive)} ·{" "}
          {averageProgress}%
        </span>
        <ProgressBar
          className="mt-2 h-1"
          isActive
          value={averageProgress}
        />
      </span>
    </button>
  );
}
