/** Форматирует примерную длительность задачи для мета-строки в карточке/строке. */
export function formatEta(seconds: number) {
  if (seconds < 60) {
    return `~ ${seconds} сек`;
  }

  const minutes = Math.round(seconds / 60);

  return `~ ${minutes} мин`;
}

/** Форматирует стоимость задачи в кредитах короткой подписью из макета. */
export function formatCredits(credits: number) {
  return `${credits} cr`;
}
