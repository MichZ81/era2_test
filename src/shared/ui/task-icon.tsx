import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export interface TaskIconProps {
  /** Иконка или превью внутри thumb-контейнера. */
  children: ReactNode;

  /** Дополнительные классы для локальной адаптации. */
  className?: string;
}

/** Thumb-иконка задачи по макету Queue. */
export function TaskIcon({ children, className }: TaskIconProps) {
  return (
    <div
      className={cn(
        "box-border flex size-[56px] flex-none flex-row items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#3B1A0A_0%,#1A1614_70.72%)] p-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
