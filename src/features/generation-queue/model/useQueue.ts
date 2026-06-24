import { createContext, useContext, type Dispatch } from "react";

import type {
  GenerationTask,
  GenerationTaskId,
} from "@/entities/generation-task";

import type { QueueAction, QueueState } from "./queueReducer";
import type {
  QueueListQuery,
  QueueStats,
  QueueStatusFilter,
  QueueTypeFilter,
} from "./selectors";

/** Команды очереди, которые UI вызывает без знания action-формата редьюсера. */
export interface QueueActions {
  /** Отменяет running или queued задачу. */
  cancelTask: (id: GenerationTaskId) => void;

  /** Возвращает failed или canceled задачу в очередь. */
  retryTask: (id: GenerationTaskId) => void;

  /** Удаляет задачу из списка. */
  deleteTask: (id: GenerationTaskId) => void;

  /** Очищает все задачи со статусом done. */
  clearDoneTasks: () => void;

  /** Повторяет первичную загрузку сида после ошибки. */
  retryLoad: () => void;
}

/** Управление фильтрами и поиском списка задач. */
export interface QueueViewControls {
  /** Текущие параметры списка задач. */
  query: QueueListQuery;

  /** Меняет фильтр по статусу. */
  setStatusFilter: (status: QueueStatusFilter) => void;

  /** Меняет фильтр по типу генерации. */
  setTypeFilter: (type: QueueTypeFilter) => void;

  /** Меняет поисковую строку. */
  setSearch: (search: string) => void;

  /** Меняет сортировку списка. */
  setSort: (sort: NonNullable<QueueListQuery["sort"]>) => void;
}

/** Значение контекста очереди, которое получает страница, виджет и глобальный статус-бар. */
export interface QueueContextValue {
  /** Сырое состояние редьюсера для редких случаев, когда нужны loadStatus/loadError целиком. */
  state: QueueState;

  /** Все задачи без фильтров. */
  tasks: readonly GenerationTask[];

  /** Задачи после фильтров, поиска и сортировки. */
  visibleTasks: readonly GenerationTask[];

  /** Активные задачи для глобального статус-бара. */
  activeTasks: readonly GenerationTask[];

  /** Сводные счетчики очереди. */
  stats: QueueStats;

  /** Управление отображением списка. */
  view: QueueViewControls;

  /** Пользовательские команды очереди. */
  actions: QueueActions;

  /** Низкоуровневый dispatch оставлен для QueueProvider и точечных интеграций. */
  dispatch: Dispatch<QueueAction>;
}

/** React-контекст единого источника правды очереди генераций. */
export const QueueContext = createContext<QueueContextValue | undefined>(
  undefined,
);

/** Публичный hook доступа к очереди генераций и пользовательским действиям. */
export function useQueue() {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error("useQueue must be used within QueueProvider");
  }

  return context;
}
