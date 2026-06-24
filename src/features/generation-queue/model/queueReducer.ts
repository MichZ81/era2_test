import {
  TASK_STATUS,
  type GenerationTask,
  type GenerationTaskError,
  type GenerationTaskId,
} from "@/entities/generation-task";

import type { QueueEngineAction } from "./queueEngine";

/** Состояние первичной загрузки данных очереди. */
export type QueueLoadStatus = "idle" | "loading" | "ready" | "error";

/** Единое состояние фичи очереди генераций. */
export interface QueueState {
  /** Актуальный список задач генерации. */
  tasks: GenerationTask[];

  /** Статус первичной загрузки или восстановления задач. */
  loadStatus: QueueLoadStatus;

  /** Текст ошибки загрузки, если инициализация сида не удалась. */
  loadError: string | null;
}

/** Пользовательские и инфраструктурные действия, которые не приходят из движка. */
export type QueueUserAction =
  | {
      type: "queue/loadStarted";
    }
  | {
      type: "queue/loadSucceeded";
      payload: {
        tasks: readonly GenerationTask[];
      };
    }
  | {
      type: "queue/loadFailed";
      payload: {
        message: string;
      };
    }
  | {
      type: "queue/tasksRestored";
      payload: {
        tasks: readonly GenerationTask[];
        restoredAt: string;
      };
    }
  | {
      type: "queue/taskCanceled";
      payload: {
        id: GenerationTaskId;
        canceledAt: string;
      };
    }
  | {
      type: "queue/taskRetried";
      payload: {
        id: GenerationTaskId;
        retriedAt: string;
      };
    }
  | {
      type: "queue/taskDeleted";
      payload: {
        id: GenerationTaskId;
      };
    }
  | {
      type: "queue/doneTasksCleared";
    };

export type QueueAction = QueueUserAction | QueueEngineAction;

/** Начальное состояние очереди до загрузки сида или восстановления localStorage. */
export const initialQueueState: QueueState = {
  tasks: [],
  loadStatus: "idle",
  loadError: null,
};

/** Чистый редьюсер очереди: применяет только разрешенные переходы конечного автомата. */
export function queueReducer(
  state: QueueState,
  action: QueueAction,
): QueueState {
  switch (action.type) {
    case "queue/loadStarted":
      return {
        ...state,
        loadStatus: "loading",
        loadError: null,
      };

    case "queue/loadSucceeded":
      return {
        tasks: [...action.payload.tasks],
        loadStatus: "ready",
        loadError: null,
      };

    case "queue/loadFailed":
      return {
        ...state,
        loadStatus: "error",
        loadError: action.payload.message,
      };

    case "queue/tasksRestored":
      return {
        tasks: normalizeRestoredTasks(
          action.payload.tasks,
          action.payload.restoredAt,
        ),
        loadStatus: "ready",
        loadError: null,
      };

    case "queue/taskStarted":
      return updateTask(state, action.payload.id, (task) => {
        /** Стартовать можно только задачу, которая реально ожидает слот. */
        if (task.status !== TASK_STATUS.queued) {
          return task;
        }

        return {
          ...task,
          status: TASK_STATUS.running,
          progress: Math.max(0, task.progress),
          startedAt: action.payload.startedAt,
          updatedAt: action.payload.startedAt,
          error: undefined,
        };
      });

    case "queue/taskProgressed":
      return updateTask(state, action.payload.id, (task) => {
        /** Запоздалые тики после cancel/done/failed не должны менять задачу. */
        if (task.status !== TASK_STATUS.running) {
          return task;
        }

        return {
          ...task,
          progress: clampProgress(action.payload.progress),
          updatedAt: action.payload.updatedAt,
        };
      });

    case "queue/taskCompleted":
      return updateTask(state, action.payload.id, (task) => {
        /** Завершить можно только задачу, которая сейчас выполняется. */
        if (task.status !== TASK_STATUS.running) {
          return task;
        }

        return {
          ...task,
          status: TASK_STATUS.done,
          progress: 100,
          updatedAt: action.payload.finishedAt,
          finishedAt: action.payload.finishedAt,
          error: undefined,
        };
      });

    case "queue/taskFailed":
      return updateTask(state, action.payload.id, (task) => {
        /** Сбой валиден только для running-задач. */
        if (task.status !== TASK_STATUS.running) {
          return task;
        }

        return failTask(task, action.payload.error, action.payload.failedAt);
      });

    case "queue/taskCanceled":
      return updateTask(state, action.payload.id, (task) => {
        /** Пользователь может отменить только активную или ожидающую задачу. */
        if (
          task.status !== TASK_STATUS.running &&
          task.status !== TASK_STATUS.queued
        ) {
          return task;
        }

        return {
          ...task,
          status: TASK_STATUS.canceled,
          updatedAt: action.payload.canceledAt,
          finishedAt: action.payload.canceledAt,
          error: undefined,
        };
      });

    case "queue/taskRetried":
      return updateTask(state, action.payload.id, (task) => {
        /** Повтор доступен только для ошибочных или отмененных задач. */
        if (
          task.status !== TASK_STATUS.failed &&
          task.status !== TASK_STATUS.canceled
        ) {
          return task;
        }

        return {
          ...task,
          status: TASK_STATUS.queued,
          progress: 0,
          queuedAt: action.payload.retriedAt,
          startedAt: undefined,
          finishedAt: undefined,
          updatedAt: action.payload.retriedAt,
          error: undefined,
          result: undefined,
        };
      });

    case "queue/taskDeleted":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };

    case "queue/doneTasksCleared":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.status !== TASK_STATUS.done),
      };

    default:
      return assertNever(action);
  }
}

/** Обновляет одну задачу по id, сохраняя ссылку на state, если фактических изменений нет. */
function updateTask(
  state: QueueState,
  id: GenerationTaskId,
  update: (task: GenerationTask) => GenerationTask,
): QueueState {
  let hasChanged = false;
  const tasks = state.tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    const nextTask = update(task);
    hasChanged ||= nextTask !== task;

    return nextTask;
  });

  if (!hasChanged) {
    return state;
  }

  return {
    ...state,
    tasks,
  };
}

/** Готовит задачи из localStorage к безопасному повторному запуску после перезагрузки. */
function normalizeRestoredTasks(
  tasks: readonly GenerationTask[],
  restoredAt: string,
) {
  return tasks.map((task) => {
    /** При восстановлении running-задачи возвращаем в queued, чтобы движок заново выдал слот. */
    if (task.status !== TASK_STATUS.running) {
      return task;
    }

    return {
      ...task,
      status: TASK_STATUS.queued,
      queuedAt: restoredAt,
      startedAt: undefined,
      finishedAt: undefined,
      updatedAt: restoredAt,
      error: undefined,
    };
  });
}

/** Переводит running-задачу в failed с пользовательской ошибкой. */
function failTask(
  task: GenerationTask,
  error: GenerationTaskError,
  failedAt: string,
): GenerationTask {
  return {
    ...task,
    status: TASK_STATUS.failed,
    updatedAt: failedAt,
    finishedAt: failedAt,
    error,
  };
}

/** Ограничивает прогресс валидным диапазоном и приводит к целому проценту. */
function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/** Защищает switch от забытых action-веток на уровне TypeScript. */
function assertNever(value: never): never {
  throw new Error(`Unknown queue action: ${JSON.stringify(value)}`);
}
