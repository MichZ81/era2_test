import { Loader2, Minimize2 } from "lucide-react";

import { TASK_STATUS, type GenerationTask } from "@/entities/generation-task";
import { Link } from "@/shared/routing";

import {
  getGenerationModelLabel,
  getGenerationTypeLabel,
} from "../lib/formatGenerationTaskLabel";
import { ProgressBar } from "./ProgressBar";

export interface GenerationQueueSingleStatusProps {
  /** Единственная активная задача, которую нужно показать компактно. */
  task: GenerationTask;

  /** Сворачивает глобальный статус-бар в пилюлю. */
  onCollapse: () => void;
}

/** Компактная карточка глобального статус-бара для одной активной генерации. */
export function GenerationQueueSingleStatus({
  task,
  onCollapse,
}: GenerationQueueSingleStatusProps) {
  const modelLabel = getGenerationModelLabel(task);
  const progress = Math.round(task.progress);

  return (
    <div className="rounded-[22px] border border-[var(--c-line)] bg-[var(--c-bg-1)] p-4 text-[var(--c-fg)] shadow-[0_22px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link
          aria-label="Открыть очередь генераций"
          className="min-w-0 flex flex-1 items-center gap-3 transition-transform hover:-translate-y-0.5"
          to="/queue"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--c-accent-soft)] text-[var(--c-accent-2)]">
            <Loader2 className="size-5 animate-spin" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold">
                {getGenerationTypeLabel(task.type)} · {modelLabel}
              </p>
              <span className="shrink-0 font-mono text-sm font-semibold text-[var(--c-accent-2)]">
                {progress}%
              </span>
            </div>
            <ProgressBar
              className="mt-2 h-1.5"
              isActive={task.status === TASK_STATUS.running}
              value={task.progress}
            />
          </div>
        </Link>

        <button
          aria-label="Свернуть статус генераций"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--c-line)] text-[var(--c-fg-dim)] transition-colors hover:border-[var(--c-line-2)] hover:text-[var(--c-fg)]"
          onClick={onCollapse}
          type="button"
        >
          <Minimize2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
