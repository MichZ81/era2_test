import { useCallback, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
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
}

/** Скругленный чип фильтра для тулбаров. */
export function QueueFilterChip<TValue extends string = string>({
  active,
  value,
  children,
  onSelect,
}: QueueFilterChipProps<TValue>) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <Chip
      active={active}
      aria-pressed={active}
      className={cn(
        "h-[62px] shrink-0 px-7 text-[22px] font-semibold",
        active
          ? "border-[var(--c-accent)] bg-[var(--c-accent)] text-white shadow-[0_12px_32px_-16px_rgba(232,84,32,0.75)]"
          : "border-[var(--c-line)] bg-[var(--c-bg-1)] text-[var(--c-fg-mute)] hover:border-[var(--c-line-2)] hover:text-[var(--c-fg)]",
      )}
      onClick={handleClick}
    >
      {children}
    </Chip>
  );
}
