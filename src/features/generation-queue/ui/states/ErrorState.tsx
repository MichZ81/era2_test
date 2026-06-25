import { AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

export interface ErrorStateProps {
  /** Текст ошибки загрузки очереди. */
  message?: string | null;

  /** Повторная попытка загрузки. */
  onRetry: () => void;

  /** Дополнительные классы для размещения состояния в виджете. */
  className?: string;
}

/** Состояние ошибки первичной загрузки очереди. */
export function ErrorState({
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-[rgba(255,105,105,0.28)] bg-[var(--c-bg)] px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-[22px] bg-red-500/12 text-red-300">
        <AlertTriangle className="size-7" />
      </div>

      <h3 className="mt-6 text-[26px] font-semibold leading-tight text-[var(--c-fg)]">
        Не удалось загрузить очередь
      </h3>
      <p className="mt-3 max-w-md text-base leading-7 text-[var(--c-fg-mute)]">
        {message || "Попробуйте повторить загрузку. Данные не будут потеряны."}
      </p>

      <Button className="mt-7" onClick={onRetry} type="button">
        <RefreshCw className="size-4" />
        Повторить
      </Button>
    </section>
  );
}
