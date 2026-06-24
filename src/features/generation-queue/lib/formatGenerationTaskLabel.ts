import type { GenerationTask } from "@/entities/generation-task";

/** Человекочитаемые названия типов генераций для UI очереди. */
const TYPE_LABELS: Record<GenerationTask["type"], string> = {
  text: "Текст",
  image: "Изображение",
  video: "Видео",
  audio: "Аудио",
};

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
