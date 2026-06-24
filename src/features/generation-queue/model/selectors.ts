import {
  TASK_STATUS,
  type GenerationTask,
  type GenerationTaskId,
  type GenType,
  type TaskStatus,
} from "@/entities/generation-task";

/** Фильтр статуса для списка задач очереди. */
export type QueueStatusFilter = TaskStatus | "all";

/** Фильтр типа генерации для списка задач очереди. */
export type QueueTypeFilter = GenType | "all";

/** Вариант сортировки списка задач. */
export type QueueSort = "newest" | "oldest" | "status" | "progress";

/** Параметры выборки задач для тулбара очереди. */
export interface QueueListQuery {
  /** Активный фильтр по статусу задачи. */
  status?: QueueStatusFilter;

  /** Активный фильтр по типу генерации. */
  type?: QueueTypeFilter;

  /** Текст поиска по prompt и модели. */
  search?: string;

  /** Выбранная сортировка списка. */
  sort?: QueueSort;
}

/** Сводные счетчики очереди для карточек статистики и глобального статус-бара. */
export interface QueueStats {
  /** Всего задач в очереди. */
  total: number;

  /** Количество задач в ожидании слота. */
  queued: number;

  /** Количество задач, которые выполняются прямо сейчас. */
  running: number;

  /** Количество успешно завершенных задач. */
  done: number;

  /** Количество задач, завершившихся ошибкой. */
  failed: number;

  /** Количество задач, отмененных пользователем. */
  canceled: number;

  /** Активные задачи: queued + running. */
  active: number;

  /** Средний прогресс активных задач для глобального индикатора. */
  averageActiveProgress: number;
}

/** Порядок статусов для сортировки списка по состоянию задачи. */
const STATUS_ORDER: Record<TaskStatus, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  done: 3,
  canceled: 4,
};

/** Возвращает сводные счетчики по текущему списку задач. */
export function selectQueueStats(
  tasks: readonly GenerationTask[],
): QueueStats {
  const queued = countByStatus(tasks, TASK_STATUS.queued);
  const running = countByStatus(tasks, TASK_STATUS.running);
  const done = countByStatus(tasks, TASK_STATUS.done);
  const failed = countByStatus(tasks, TASK_STATUS.failed);
  const canceled = countByStatus(tasks, TASK_STATUS.canceled);
  const activeTasks = selectActiveTasks(tasks);

  return {
    total: tasks.length,
    queued,
    running,
    done,
    failed,
    canceled,
    active: queued + running,
    averageActiveProgress: selectAverageProgress(activeTasks),
  };
}

/** Выбирает задачи, которые еще требуют работы движка: queued или running. */
export function selectActiveTasks(tasks: readonly GenerationTask[]) {
  return tasks.filter(
    (task) =>
      task.status === TASK_STATUS.queued ||
      task.status === TASK_STATUS.running,
  );
}

/** Выбирает running-задачи для прогресс-тика и локального UI. */
export function selectRunningTasks(tasks: readonly GenerationTask[]) {
  return tasks.filter((task) => task.status === TASK_STATUS.running);
}

/** Выбирает queued-задачи в FIFO-порядке по createdAt. */
export function selectQueuedTasks(tasks: readonly GenerationTask[]) {
  return tasks
    .filter((task) => task.status === TASK_STATUS.queued)
    .sort(compareByCreatedAtAsc);
}

/** Возвращает 1-based позицию задачи в очереди или null, если задача не queued. */
export function selectQueuedPosition(
  tasks: readonly GenerationTask[],
  id: GenerationTaskId,
) {
  const position = selectQueuedTasks(tasks).findIndex((task) => task.id === id);

  return position === -1 ? null : position + 1;
}

/** Возвращает средний прогресс переданного списка задач. */
export function selectAverageProgress(tasks: readonly GenerationTask[]) {
  if (tasks.length === 0) {
    return 0;
  }

  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);

  return Math.round(totalProgress / tasks.length);
}

/** Применяет фильтры, поиск и сортировку к списку задач очереди. */
export function selectQueueTasks(
  tasks: readonly GenerationTask[],
  query: QueueListQuery = {},
) {
  const {
    status = "all",
    type = "all",
    search = "",
    sort = "newest",
  } = query;
  const normalizedSearch = normalizeSearch(search);

  return tasks
    .filter((task) => filterByStatus(task, status))
    .filter((task) => filterByType(task, type))
    .filter((task) => filterBySearch(task, normalizedSearch))
    .sort(getTaskComparator(sort));
}

/** Проверяет, есть ли задачи после применения пользовательских фильтров. */
export function selectHasQueueResults(
  tasks: readonly GenerationTask[],
  query: QueueListQuery = {},
) {
  return selectQueueTasks(tasks, query).length > 0;
}

/** Считает задачи с конкретным статусом. */
function countByStatus(tasks: readonly GenerationTask[], status: TaskStatus) {
  return tasks.filter((task) => task.status === status).length;
}

/** Проверяет соответствие задачи фильтру статуса. */
function filterByStatus(task: GenerationTask, status: QueueStatusFilter) {
  return status === "all" || task.status === status;
}

/** Проверяет соответствие задачи фильтру типа генерации. */
function filterByType(task: GenerationTask, type: QueueTypeFilter) {
  return type === "all" || task.type === type;
}

/** Проверяет совпадение задачи с поисковой строкой по prompt и модели. */
function filterBySearch(task: GenerationTask, search: string) {
  if (!search) {
    return true;
  }

  return getTaskSearchText(task).includes(search);
}

/** Собирает текстовые поля задачи в одну строку для поиска. */
function getTaskSearchText(task: GenerationTask) {
  return normalizeSearch(
    [
      task.prompt,
      task.model.name,
      task.model.version,
      task.model.provider,
      task.error?.message,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Нормализует поисковую строку для устойчивого сравнения. */
function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

/** Возвращает компаратор для выбранной сортировки. */
function getTaskComparator(sort: QueueSort) {
  switch (sort) {
    case "oldest":
      return compareByCreatedAtAsc;

    case "status":
      return compareByStatus;

    case "progress":
      return compareByProgressDesc;

    case "newest":
    default:
      return compareByCreatedAtDesc;
  }
}

/** Сортирует задачи от старых к новым. */
function compareByCreatedAtAsc(left: GenerationTask, right: GenerationTask) {
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

/** Сортирует задачи от новых к старым. */
function compareByCreatedAtDesc(left: GenerationTask, right: GenerationTask) {
  return compareByCreatedAtAsc(right, left);
}

/** Сортирует задачи по приоритету статуса, затем по новизне. */
function compareByStatus(left: GenerationTask, right: GenerationTask) {
  const statusDiff = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];

  return statusDiff === 0 ? compareByCreatedAtDesc(left, right) : statusDiff;
}

/** Сортирует задачи по прогрессу от большего к меньшему. */
function compareByProgressDesc(left: GenerationTask, right: GenerationTask) {
  const progressDiff = right.progress - left.progress;

  return progressDiff === 0 ? compareByCreatedAtDesc(left, right) : progressDiff;
}
