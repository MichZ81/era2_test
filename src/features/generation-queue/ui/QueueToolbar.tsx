import { Search } from "lucide-react";

import { TASK_STATUS } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { QueueFilterChip } from "@/shared/ui/queue-filter-chip";
import { QueueSelect } from "@/shared/ui/queue-select";

import type {
  QueueListQuery,
  QueueSort,
  QueueStatusFilter,
  QueueTypeFilter,
} from "../model/selectors";

export interface QueueToolbarProps {
  /** Текущее состояние фильтров, поиска и сортировки. */
  query: QueueListQuery;

  /** Дополнительные классы для встраивания тулбара в виджет. */
  className?: string;

  /** Показывает бонусный фильтр по типу генерации. */
  showTypeFilter?: boolean;

  /** Вызывается при выборе статуса. */
  onStatusChange: (status: QueueStatusFilter) => void;

  /** Вызывается при выборе сортировки. */
  onSortChange: (sort: QueueSort) => void;

  /** Вызывается при вводе поисковой строки. */
  onSearchChange: (search: string) => void;

  /** Вызывается при выборе типа генерации, если showTypeFilter включен. */
  onTypeChange?: (type: QueueTypeFilter) => void;
}

/** Статусы в порядке из макета тулбара. */
const STATUS_FILTERS: Array<{
  value: QueueStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Все" },
  { value: TASK_STATUS.queued, label: "В очереди" },
  { value: TASK_STATUS.running, label: "Идет" },
  { value: TASK_STATUS.done, label: "Готово" },
  { value: TASK_STATUS.failed, label: "Ошибка" },
];

/** Опции сортировки из ТЗ и бонусные варианты селекторов. */
const SORT_OPTIONS: Array<{
  value: QueueSort;
  label: string;
}> = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "status", label: "По статусу" },
  { value: "progress", label: "По прогрессу" },
];

/** Опциональные типы генераций для бонусного фильтра. */
const TYPE_OPTIONS: Array<{
  value: QueueTypeFilter;
  label: string;
}> = [
  { value: "all", label: "Все типы" },
  { value: "text", label: "Текст" },
  { value: "image", label: "Изображения" },
  { value: "video", label: "Видео" },
  { value: "audio", label: "Аудио" },
];

/** Тулбар очереди: чипы статусов, сортировка и поиск. */
export function QueueToolbar({
  query,
  className,
  showTypeFilter,
  onStatusChange,
  onSortChange,
  onSearchChange,
  onTypeChange,
}: QueueToolbarProps) {
  const activeStatus = query.status ?? "all";
  const activeSort = query.sort ?? "newest";
  const activeType = query.type ?? "all";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="no-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1">
        {STATUS_FILTERS.map((filter) => (
          <QueueFilterChip
            active={activeStatus === filter.value}
            key={filter.value}
            onClick={() => onStatusChange(filter.value)}
          >
            {filter.label}
          </QueueFilterChip>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showTypeFilter && (
          <QueueSelect
            label="Тип"
            onValueChange={(value) => onTypeChange?.(value as QueueTypeFilter)}
            options={TYPE_OPTIONS}
            value={activeType}
          />
        )}

        <QueueSelect
          label="Сортировка"
          onValueChange={(value) => onSortChange(value as QueueSort)}
          options={SORT_OPTIONS}
          value={activeSort}
        />

        <label className="relative block min-w-0 sm:w-[280px]">
          <span className="sr-only">Поиск по задачам</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[var(--c-fg-low)]" />
          <Input
            className="h-[62px] rounded-full border-[var(--c-line)] bg-[var(--c-bg-1)] pl-13 pr-5 text-[18px] text-[var(--c-fg)] placeholder:text-[var(--c-fg-low)] focus-visible:ring-[var(--c-accent)]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск"
            type="search"
            value={query.search ?? ""}
          />
        </label>
      </div>
    </div>
  );
}
