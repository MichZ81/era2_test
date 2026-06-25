import {
  ArrowRight,
  ChevronDown,
  Circle,
  FileText,
  ImageIcon,
  Music,
  Play,
} from "lucide-react";

import {
  TASK_STATUS,
  type GenerationTask,
  type GenType,
  type TaskStatus,
} from "@/entities/generation-task";
import { Link } from "@/shared/routing";
import { TaskIcon } from "@/shared/ui/task-icon";

import { pluralizeActiveGenerations } from "../lib/formatGenerationTaskLabel";
import { ProgressBar } from "./ProgressBar";

export interface GenerationQueueMultipleStatusProps {
  /** Общее количество queued + running задач. */
  totalActive: number;

  /** Усредненный прогресс активных задач. */
  averageProgress: number;

  /** Первые задачи для мини-списка. */
  previewTasks: readonly GenerationTask[];

  /** Сворачивает глобальный статус-бар в пилюлю. */
  onCollapse: () => void;
}

/** Раскрытый глобальный статус-бар для нескольких активных генераций. */
export function GenerationQueueMultipleStatus({
  totalActive,
  averageProgress,
  previewTasks,
  onCollapse,
}: GenerationQueueMultipleStatusProps) {
  return (
    <div className="box-border flex h-[211px] w-full flex-col items-start overflow-hidden rounded-[18px] border border-[rgba(232,84,32,0.35)] bg-[#1A1614] p-0 text-[#F6EFE9] shadow-[0_0_30px_-6px_rgba(232,84,33,0.18),0_16px_40px_-4px_rgba(0,0,0,0.55)] sm:w-[332px]">
      <div className="flex h-[56px] w-full flex-none flex-row items-center gap-[10px] px-3 py-3 pl-[14px]">
        <span className="box-border flex size-[18px] flex-none items-center justify-center rounded-full border-2 border-[#E85420]">
          <span className="size-1.5 rounded-full bg-[#E85420]" />
        </span>

        <div className="flex h-8 min-w-0 flex-1 flex-col items-start gap-px">
          <p className="h-[17px] text-[13px] font-semibold leading-[17px] text-[#F6EFE9]">
            Генерации идут
          </p>
          <p className="h-[14px] font-mono text-[11px] font-normal leading-[14px] text-[#8A7F78]">
            {totalActive} {pluralizeActiveGenerations(totalActive)} ·{" "}
            {averageProgress}%
          </p>
        </div>

        <button
          aria-label="Свернуть статус генераций"
          className="flex h-[18px] w-2 flex-none items-center justify-center text-[#8A7F78] transition-colors hover:text-[#F6EFE9]"
          onClick={onCollapse}
          type="button"
        >
          <ChevronDown className="size-3.5" strokeWidth={2.2} />
        </button>
      </div>

      <ul className="flex h-[116px] w-full flex-none flex-col items-start gap-[10px] px-[14px] pb-[10px] pt-0.5">
        {previewTasks.map((task) => (
          <li
            className="flex h-7 w-full flex-none items-center gap-[10px]"
            key={task.id}
          >
            <TaskIcon className="size-7 rounded-[8px] text-[#FF7A3D]">
              <TaskStatusIcon task={task} />
            </TaskIcon>

            <div
              className={
                task.status === TASK_STATUS.running
                  ? "flex h-6 min-w-0 flex-1 flex-col items-start gap-1"
                  : "flex h-4 min-w-0 flex-1 flex-col items-start"
              }
            >
              <span className="h-4 w-full truncate text-[12px] font-normal leading-4 text-[#C8BEB6]">
                {task.prompt}
              </span>
              {task.status === TASK_STATUS.running && (
                <ProgressBar
                  className="h-1 w-full flex-none bg-[#221C19]"
                  indicatorClassName="bg-[linear-gradient(135deg,#E85421_0%,#FF7A3D_70.72%)] shadow-none"
                  isActive
                  value={task.progress}
                />
              )}
            </div>

            {task.status === TASK_STATUS.running ? (
              <span className="h-[14px] w-5 flex-none font-mono text-[11px] font-medium leading-[14px] text-[#FF7A3D]">
                {Math.round(task.progress)}%
              </span>
            ) : (
              <span
                className={`h-[14px] w-[60px] flex-none font-mono text-[11px] font-medium leading-[14px] ${STATUS_VIEW[task.status].className}`}
              >
                {STATUS_VIEW[task.status].label}
              </span>
            )}
          </li>
        ))}
      </ul>

      <Link
        className="box-border flex h-[39px] w-full flex-none items-center justify-center gap-1.5 border border-[#2D2420] text-[13px] font-medium leading-[17px] text-[#FF7A3D] transition-colors hover:text-[#FF8A52]"
        to="/queue"
      >
        Открыть очередь
        <ArrowRight className="size-[13px]" strokeWidth={2.2} />
      </Link>
    </div>
  );
}

function TaskStatusIcon({ task }: { task: GenerationTask }) {
  if (task.status === TASK_STATUS.running) {
    const TypeIcon = TYPE_ICON[task.type];
    return <TypeIcon className="size-3" strokeWidth={2.3} />;
  }

  return (
    <Circle
      className="size-3"
      fill={STATUS_VIEW[task.status].iconColor}
      strokeWidth={0}
    />
  );
}

const TYPE_ICON: Record<GenType, typeof FileText> = {
  text: FileText,
  image: ImageIcon,
  video: Play,
  audio: Music,
};

const STATUS_VIEW: Record<
  TaskStatus,
  {
    label: string;
    className: string;
    iconColor: string;
  }
> = {
  [TASK_STATUS.queued]: {
    label: "в очереди",
    className: "text-[#8A7F78]",
    iconColor: "#FF7A3D",
  },
  [TASK_STATUS.running]: {
    label: "",
    className: "text-[#FF7A3D]",
    iconColor: "#FF7A3D",
  },
  [TASK_STATUS.done]: {
    label: "готово",
    className: "text-[#34D399]",
    iconColor: "#34D399",
  },
  [TASK_STATUS.failed]: {
    label: "ошибка",
    className: "text-[#FF6B6B]",
    iconColor: "#FF6B6B",
  },
  [TASK_STATUS.canceled]: {
    label: "отменено",
    className: "text-[#8A7F78]",
    iconColor: "#8A7F78",
  },
};
