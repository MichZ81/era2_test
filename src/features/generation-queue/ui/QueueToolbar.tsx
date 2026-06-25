import { useCallback, type ChangeEvent } from "react";
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
  /** Текущее состояние фильтров и сортировки. */
  query: QueueListQuery;

  /** Дополнительные классы для встраивания тулбара в виджет. */
  className?: string;

  /** Показывает бонусный фильтр по типу генерации. */
  showTypeFilter?: boolean;

  /** Вызывается при выборе статуса. */
  onStatusChange: (status: QueueStatusFilter) => void;

  /** Вызывается при изменении поисковой строки. */
  onSearchChange: (search: string) => void;

  /** Вызывается при выборе сортировки. */
  onSortChange: (sort: QueueSort) => void;

  /** Вызывается при выборе типа генерации, если showTypeFilter включен. */
  onTypeChange?: (type: QueueTypeFilter) => void;
}

/** Статусы в порядке из макета тулбара. */
const STATUS_FILTERS: Array<{
  value: QueueStatusFilter;
  label: string;
  className: string;
}> = [
  { value: "all", label: "Все", className: "w-[52px]" },
  { value: TASK_STATUS.queued, label: "В очереди", className: "w-[95px]" },
  { value: TASK_STATUS.running, label: "Идет", className: "w-[62px]" },
  { value: TASK_STATUS.done, label: "Готово", className: "w-[72px]" },
  { value: TASK_STATUS.failed, label: "Ошибка", className: "w-[79px]" },
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

/** Тулбар очереди: чипы статусов и сортировка. */
export function QueueToolbar({
  query,
  className,
  showTypeFilter,
  onStatusChange,
  onSearchChange,
  onSortChange,
  onTypeChange,
}: QueueToolbarProps) {
  const activeStatus = query.status ?? "all";
  const activeSearch = query.search ?? "";
  const activeSort = query.sort ?? "newest";
  const activeType = query.type ?? "all";

  const handleTypeChange = useCallback(
    (value: QueueTypeFilter) => {
      onTypeChange?.(value);
    },
    [onTypeChange],
  );

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange],
  );

  const handleSortChange = useCallback(
    (value: QueueSort) => {
      onSortChange(value);
    },
    [onSortChange],
  );

  return (
    <div
      className={cn(
        "no-scrollbar -mx-4 flex h-[34px] w-[calc(100%+32px)] flex-row items-center gap-3 overflow-x-auto px-4 md:mx-0 md:w-full md:flex-none md:px-0 lg:overflow-visible lg:justify-start",
        className,
      )}
    >
      <div className="flex h-[34px] w-[392px] flex-none items-start gap-2">
        {STATUS_FILTERS.map((filter) => (
          <QueueFilterChip
            active={activeStatus === filter.value}
            className={filter.className}
            key={filter.value}
            onSelect={onStatusChange}
            value={filter.value}
          >
            {filter.label}
          </QueueFilterChip>
        ))}
      </div>

      <span
        aria-hidden="true"
        className="h-px w-[10px] flex-none"
      />

      <label className="relative h-[34px] w-[220px] min-w-[220px] flex-none">
        <span className="sr-only">Поиск по очереди</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-[14px] top-1/2 size-3.5 -translate-y-1/2 text-[#8A7F78]"
        />
        <Input
          className="h-[34px] rounded-full border-[#2D2420] bg-[#1A1514] pl-9 pr-[14px] text-[13px] leading-[17px] text-[#C8BEB6] shadow-none placeholder:text-[#8A7F78] focus-visible:ring-[#E85420]"
          onChange={handleSearchChange}
          placeholder="Поиск"
          type="search"
          value={activeSearch}
        />
      </label>

      <div className="flex h-[34px] flex-none flex-row items-center gap-3">
        {showTypeFilter && (
          <QueueSelect
            label="Тип"
            onValueChange={handleTypeChange}
            options={TYPE_OPTIONS}
            value={activeType}
          />
        )}

        <QueueSelect
          className="w-[135px] min-w-[135px] [&>span:first-child]:w-[98px]"
          label="Сортировка"
          onValueChange={handleSortChange}
          options={SORT_OPTIONS}
          value={activeSort}
        />
      </div>
    </div>
  );
}
