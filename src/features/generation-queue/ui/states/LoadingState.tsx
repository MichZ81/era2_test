import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

export interface LoadingStateProps {
  /** Количество строк-скелетонов в списке. */
  rows?: number;

  /** Дополнительные классы для контейнера состояния. */
  className?: string;
}

/** Состояние первичной загрузки очереди с skeleton-разметкой будущего экрана. */
export function LoadingState({ rows = 4, className }: LoadingStateProps) {
  return (
    <section
      aria-label="Загрузка очереди генераций"
      className={cn("space-y-5", className)}
    >
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-[93px] rounded-[26px]" key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-[34px] w-36 shrink-0 rounded-full" key={index} />
          ))}
        </div>
        <Skeleton className="h-[34px] w-full rounded-full sm:w-[248px]" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            className="h-[134px] rounded-[16px] md:h-[89px]"
            key={index}
          />
        ))}
      </div>
    </section>
  );
}
