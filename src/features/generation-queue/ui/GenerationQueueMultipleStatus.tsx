import { ArrowRight, Loader2 } from "lucide-react";

import { TASK_STATUS, type GenerationTask } from "@/entities/generation-task";
import { Link } from "@/shared/routing";

import {
  getGenerationModelLabel,
  getGenerationTypeLabel,
  pluralizeActiveGenerations,
} from "../lib/formatGenerationTaskLabel";
import { ProgressBar } from "./ProgressBar";

export interface GenerationQueueMultipleStatusProps {
  /** Общее количество queued + running задач. */
  totalActive: number;

  /** Усредненный прогресс активных задач. */
  averageProgress: number;

  /** Первые задачи для мини-списка. */
  previewTasks: readonly GenerationTask[];
}

/** Раскрытый глобальный статус-бар для нескольких активных генераций. */
export function GenerationQueueMultipleStatus({
  totalActive,
  averageProgress,
  previewTasks,
}: GenerationQueueMultipleStatusProps) {
  return (
    <div className="rounded-t-[24px] border border-[var(--c-line)] bg-[var(--c-bg-1)] p-4 text-[var(--c-fg)] shadow-[0_22px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:rounded-[24px]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            Генерации идут · {totalActive}{" "}
            {pluralizeActiveGenerations(totalActive)} · {averageProgress}%
          </p>
          <ProgressBar
            className="mt-3 h-1.5"
            isActive
            value={averageProgress}
          />
        </div>
        <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-[var(--c-accent-2)]" />
      </div>

      <ul className="mt-4 space-y-3">
        {previewTasks.map((task) => (
          <li className="min-w-0" key={task.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="truncate text-xs text-[var(--c-fg-mute)]">
                {getGenerationTypeLabel(task.type)} ·{" "}
                {getGenerationModelLabel(task)}
              </span>
              <span className="shrink-0 font-mono text-xs text-[var(--c-fg-dim)]">
                {Math.round(task.progress)}%
              </span>
            </div>
            <ProgressBar
              className="h-1"
              isActive={task.status === TASK_STATUS.running}
              value={task.progress}
            />
          </li>
        ))}
      </ul>

      <Link
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--c-accent-2)] transition-colors hover:text-[var(--c-accent)]"
        to="/queue"
      >
        Открыть очередь
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
