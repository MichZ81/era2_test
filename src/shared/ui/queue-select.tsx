import { ChevronDown } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export interface QueueSelectOption<TValue extends string> {
  /** Значение пункта select. */
  value: TValue;

  /** Подпись пункта select. */
  label: string;
}

export interface QueueSelectProps<TValue extends string> {
  /** Доступное имя для screen reader. */
  label: string;

  /** Текущее выбранное значение. */
  value: TValue;

  /** Список вариантов select. */
  options: Array<QueueSelectOption<TValue>>;

  /** Обработчик выбора значения. */
  onValueChange: (value: TValue) => void;
}

/** Скругленный select для тулбаров очереди. */
export function QueueSelect<TValue extends string>({
  label,
  value,
  options,
  onValueChange,
}: QueueSelectProps<TValue>) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger
        aria-label={label}
        className="h-[34px] w-full min-w-[248px] rounded-full border-[var(--c-line)] bg-[var(--c-bg-1)] px-7 text-[13px] font-semibold text-[var(--c-fg-mute)] shadow-none hover:border-[var(--c-line-2)] hover:text-[var(--c-fg)] focus:ring-[var(--c-accent)] sm:w-auto [&>svg]:hidden"
      >
        <SelectValue />
        <ChevronDown className="ml-3 size-4 text-[var(--c-fg-low)]" />
      </SelectTrigger>
      <SelectContent className="rounded-[18px] border-[var(--c-line)] bg-[var(--c-bg-1)] text-[var(--c-fg)]">
        {options.map((option) => (
          <SelectItem
            className="rounded-xl px-4 py-3 text-[13px] focus:bg-[var(--c-accent-soft)] focus:text-[var(--c-fg)]"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
