import {
  TASK_STATUS,
  type GenerationTask,
  type TaskStatus,
} from "@/entities/generation-task";

/** Человекочитаемые названия типов генераций для UI очереди. */
const TYPE_LABELS: Record<GenerationTask["type"], string> = {
  text: "Текст",
  image: "Изображение",
  video: "Видео",
  audio: "Аудио",
};

/** Форматирует примерную длительность задачи для мета-строки в карточке/строке. */
export function formatEta(seconds: number) {
  if (seconds < 60) {
    return `≈ ${seconds} сек`;
  }

  const minutes = Math.round(seconds / 60);

  return `≈ ${minutes} мин`;
}

/** Форматирует стоимость задачи в кредитах короткой подписью из макета. */
export function formatCredits(credits: number) {
  return `${credits} cr`;
}

/** Возвращает подпись типа генерации для компактных элементов очереди. */
export function getGenerationTypeLabel(type: GenerationTask["type"]) {
  return TYPE_LABELS[type];
}

/** Собирает подпись модели из имени и версии. */
export function getGenerationModelLabel(task: GenerationTask) {
  return [task.model.name, task.model.version].filter(Boolean).join(" ");
}

/** Склоняет слово "активны" для заголовка статус-бара. */
export function pluralizeActiveGenerations(count: number) {
  return count === 1 ? "активна" : "активны";
}

/** Склоняет слово "генерация" для свернутой пилюли статус-бара. */
export function pluralizeGenerationCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "генерация";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "генерации";
  }

  return "генераций";
}

export function formatTaskTime(task: GenerationTask) {
  if (
    task.status === TASK_STATUS.running ||
    task.status === TASK_STATUS.queued
  ) {
    return formatEta(task.estimatedDurationSec);
  }

  if (isFinishedStatus(task.status) && task.startedAt && task.finishedAt) {
    return formatElapsedTime(getDurationSeconds(task.startedAt, task.finishedAt));
  }

  return formatEta(task.estimatedDurationSec);
}

function isFinishedStatus(status: TaskStatus) {
  return (
    status === TASK_STATUS.done ||
    status === TASK_STATUS.failed ||
    status === TASK_STATUS.canceled
  );
}

function getDurationSeconds(startedAt: string, finishedAt: string) {
  return Math.max(
    0,
    Math.floor(
      (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000,
    ),
  );
}

function formatElapsedTime(totalSeconds: number) {
  if (totalSeconds < 60) {
    return `${totalSeconds} сек`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    return `${minutes} мин ${seconds.toString().padStart(2, "0")} сек`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return `${hours} ч ${restMinutes.toString().padStart(2, "0")} мин`;
}
