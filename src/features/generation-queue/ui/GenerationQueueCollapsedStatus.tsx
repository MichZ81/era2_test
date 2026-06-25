import { cn } from "@/shared/lib/utils";

import { pluralizeGenerationCount } from "../lib/formatEta";

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
        "ml-auto box-border flex h-[37px] w-[180px] flex-none flex-row items-center gap-2 rounded-full border border-[rgba(232,84,32,0.4)] bg-[#1A1614] py-[10px] pl-[14px] pr-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5",
      )}
      onClick={onExpand}
      type="button"
    >
      <span className="box-border size-4 flex-none rounded-full border-2 border-[#E85420]" />
      <span className="h-[17px] flex-none whitespace-nowrap text-[13px] font-medium leading-[17px] text-[#F6EFE9]">
        {totalActive} {pluralizeGenerationCount(totalActive)}
      </span>
      <span className="h-[17px] flex-none whitespace-nowrap font-mono text-[13px] font-medium leading-[17px] text-[#FF7A3D]">
        · {averageProgress}%
      </span>
    </button>
  );
}
