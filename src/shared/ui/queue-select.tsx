import { cn } from "@/shared/lib/cn";
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

  /** Дополнительные классы trigger-кнопки. */
  className?: string;
}

/** Скругленный select для тулбаров очереди. */
export function QueueSelect<TValue extends string>({
  label,
  value,
  options,
  onValueChange,
  className,
}: QueueSelectProps<TValue>) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "box-border h-[34px] w-full min-w-[248px] flex-none gap-1.5 rounded-full border border-[#2D2420] bg-[#1A1514] py-0 pl-[14px] pr-3 text-[13px] font-normal leading-[17px] text-[#C8BEB6] shadow-none hover:border-[#3A302B] hover:text-[#F6EFE9] focus:ring-[var(--c-accent)] sm:w-auto [&_.select-icon]:hidden [&>span:first-child]:h-[17px] [&>span:first-child]:min-w-0 [&>span:first-child]:flex-none [&>span:first-child]:truncate",
          className,
        )}
      >
        <SelectValue />
        <span
          aria-hidden="true"
          className="h-[14px] w-[5px] flex-none text-[11px] font-normal leading-[14px] text-[#8A7F78]"
        >
          ▾
        </span>
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
