import { useCallback } from "react";

import { TASK_STATUS } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
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

  /** Вызывается при выборе сортировки. */
  onSortChange: (sort: QueueSort) => void;

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

/** Тулбар очереди: чипы статусов и сортировка. */
export function QueueToolbar({
  query,
  className,
  showTypeFilter,
  onStatusChange,
  onSortChange,
  onTypeChange,
}: QueueToolbarProps) {
  const activeStatus = query.status ?? "all";
  const activeSort = query.sort ?? "newest";
  const activeType = query.type ?? "all";

  const handleTypeChange = useCallback(
    (value: QueueTypeFilter) => {
      onTypeChange?.(value);
    },
    [onTypeChange],
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
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="no-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1">
        {STATUS_FILTERS.map((filter) => (
          <QueueFilterChip
            active={activeStatus === filter.value}
            key={filter.value}
            onSelect={onStatusChange}
            value={filter.value}
          >
            {filter.label}
          </QueueFilterChip>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showTypeFilter && (
          <QueueSelect
            label="Тип"
            onValueChange={handleTypeChange}
            options={TYPE_OPTIONS}
            value={activeType}
          />
        )}

        <QueueSelect
          label="Сортировка"
          onValueChange={handleSortChange}
          options={SORT_OPTIONS}
          value={activeSort}
        />
      </div>
    </div>
  );
}
