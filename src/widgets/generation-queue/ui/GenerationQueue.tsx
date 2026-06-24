import { QueueProvider } from "@/features/generation-queue";

import { GenerationQueueContent } from "./GenerationQueueContent";

/** Виджет экрана очереди: поднимает provider и рендерит композицию экрана. */
export function GenerationQueue() {
  return (
    <QueueProvider>
      <GenerationQueueContent />
    </QueueProvider>
  );
}
