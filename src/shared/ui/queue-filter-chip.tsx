import { useCallback, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Chip } from "@/shared/ui/era";

export interface QueueFilterChipProps<TValue extends string = string> {
  /** Включает активный оранжевый вид чипа. */
  active: boolean;

  /** Значение фильтра, которое будет передано наружу при выборе. */
  value: TValue;

  /** Текст чипа фильтра. */
  children: ReactNode;

  /** Вызывается при выборе фильтра. */
  onSelect: (value: TValue) => void;

  /** Дополнительные классы для точной ширины в конкретном тулбаре. */
  className?: string;
}

/** Скругленный чип фильтра для тулбаров. */
export function QueueFilterChip<TValue extends string = string>({
  active,
  value,
  children,
  onSelect,
  className,
}: QueueFilterChipProps<TValue>) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <Chip
      active={active}
      aria-pressed={active}
      className={cn(
        "h-[34px] shrink-0 justify-center whitespace-nowrap rounded-full px-[14px] text-[13px] font-medium leading-[17px]",
        active
          ? "border-[#E85420] bg-[#E85420] text-white shadow-none"
          : "border-[#2D2420] bg-[#1A1514] text-[#C8BEB6] hover:border-[#3A302B] hover:text-[#F6EFE9]",
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </Chip>
  );
}
