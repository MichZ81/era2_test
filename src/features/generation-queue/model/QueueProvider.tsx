import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  GEN_TYPES,
  TASK_STATUSES,
  generationTaskSeed,
  type GenerationTask,
  type GenerationTaskId,
  type GenType,
  type TaskStatus,
} from "@/entities/generation-task";

import { createQueueEngine, type QueueEngine } from "./queueEngine";
import {
  initialQueueState,
  queueReducer,
  type QueueState,
} from "./queueReducer";
import {
  selectActiveTasks,
  selectQueueStats,
  selectQueueTasks,
  type QueueListQuery,
  type QueueSort,
  type QueueStatusFilter,
  type QueueTypeFilter,
} from "./selectors";
import { QueueContext } from "./useQueue";

/** Ключ localStorage для персистентного состояния очереди. */
const STORAGE_KEY = "era2_generation_queue";

/** Задержка первичной загрузки сида, чтобы UI мог показать loading-state. */
const LOAD_DELAY_MS = 600;

/** Небольшая вероятность ошибки инициализации для ErrorState из ТЗ. */
const INITIAL_LOAD_FAILURE_RATE = 0.08;

export interface QueueProviderProps {
  /** Дочернее дерево, которому нужен доступ к единому стору очереди. */
  children: ReactNode;
}

/** Provider очереди генераций: reducer, движок, selectors, localStorage и actions. */
export function QueueProvider({ children }: QueueProviderProps) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);
  const [query, setQuery] = useState<QueueListQuery>({
    status: "all",
    type: "all",
    search: "",
    sort: "newest",
  });
  const debouncedSearch = useDebouncedValue(query.search ?? "", 250);
  const stateRef = useRef<QueueState>(state);
  const engineRef = useRef<QueueEngine | null>(null);
  const loadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const engine = createQueueEngine({
      getTasks: () => stateRef.current.tasks,
      dispatch,
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  const runInitialLoad = useCallback(() => {
    if (loadTimerRef.current !== null) {
      window.clearTimeout(loadTimerRef.current);
    }

    dispatch({
      type: "queue/loadStarted",
    });

    loadTimerRef.current = window.setTimeout(() => {
      loadTimerRef.current = null;

      const restoredTasks = readStoredTasks();

      if (restoredTasks) {
        /** Решение по восстановлению: running-задачи редьюсер возвращает в queued, чтобы движок заново выдал слот без старых таймеров. */
        dispatch({
          type: "queue/tasksRestored",
          payload: {
            tasks: restoredTasks,
            restoredAt: new Date().toISOString(),
          },
        });
        return;
      }

      if (Math.random() < INITIAL_LOAD_FAILURE_RATE) {
        dispatch({
          type: "queue/loadFailed",
          payload: {
            message: "Не удалось загрузить очередь генераций",
          },
        });
        return;
      }

      dispatch({
        type: "queue/loadSucceeded",
        payload: {
          tasks: generationTaskSeed,
        },
      });
    }, LOAD_DELAY_MS);
  }, []);

  useEffect(() => {
    runInitialLoad();

    return () => {
      if (loadTimerRef.current !== null) {
        window.clearTimeout(loadTimerRef.current);
      }
    };
  }, [runInitialLoad]);

  useEffect(() => {
    if (state.loadStatus !== "ready") {
      return;
    }

    engineRef.current?.sync(state.tasks);
    saveTasks(state.tasks);
  }, [state.loadStatus, state.tasks]);

  const selectorQuery = useMemo<QueueListQuery>(
    () => ({
      ...query,
      search: debouncedSearch,
    }),
    [debouncedSearch, query],
  );

  const visibleTasks = useMemo(
    () => selectQueueTasks(state.tasks, selectorQuery),
    [selectorQuery, state.tasks],
  );
  const activeTasks = useMemo(
    () => selectActiveTasks(state.tasks),
    [state.tasks],
  );
  const stats = useMemo(() => selectQueueStats(state.tasks), [state.tasks]);

  const cancelTask = useCallback((id: GenerationTaskId) => {
    const canceledAt = new Date().toISOString();

    engineRef.current?.cancelTask(id);
    dispatch({
      type: "queue/taskCanceled",
      payload: {
        id,
        canceledAt,
      },
    });
  }, []);

  const retryTask = useCallback((id: GenerationTaskId) => {
    dispatch({
      type: "queue/taskRetried",
      payload: {
        id,
        retriedAt: new Date().toISOString(),
      },
    });
  }, []);

  const deleteTask = useCallback((id: GenerationTaskId) => {
    engineRef.current?.cancelTask(id);
    dispatch({
      type: "queue/taskDeleted",
      payload: {
        id,
      },
    });
  }, []);

  const clearDoneTasks = useCallback(() => {
    dispatch({
      type: "queue/doneTasksCleared",
    });
  }, []);

  const retryLoad = useCallback(() => {
    runInitialLoad();
  }, [runInitialLoad]);

  const setStatusFilter = useCallback((status: QueueStatusFilter) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      status,
    }));
  }, []);

  const setTypeFilter = useCallback((type: QueueTypeFilter) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      type,
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      search,
    }));
  }, []);

  const setSort = useCallback((sort: QueueSort) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      sort,
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      tasks: state.tasks,
      visibleTasks,
      activeTasks,
      stats,
      view: {
        query,
        setStatusFilter,
        setTypeFilter,
        setSearch,
        setSort,
      },
      actions: {
        cancelTask,
        retryTask,
        deleteTask,
        clearDoneTasks,
        retryLoad,
      },
      dispatch,
    }),
    [
      activeTasks,
      cancelTask,
      clearDoneTasks,
      deleteTask,
      query,
      retryLoad,
      retryTask,
      setSearch,
      setSort,
      setStatusFilter,
      setTypeFilter,
      state,
      stats,
      visibleTasks,
    ],
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

/** Хук задерживает значение, чтобы поиск не пересчитывал список на каждый символ. */
function useDebouncedValue<TValue>(value: TValue, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [delayMs, value]);

  return debouncedValue;
}

/** Сохраняет задачи очереди между перезагрузками страницы. */
function saveTasks(tasks: readonly GenerationTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** Возвращает сохраненные задачи или null, если localStorage пуст/поврежден. */
function readStoredTasks() {
  const serializedTasks = localStorage.getItem(STORAGE_KEY);

  if (!serializedTasks) {
    return null;
  }

  try {
    const parsedTasks: unknown = JSON.parse(serializedTasks);

    if (!Array.isArray(parsedTasks)) {
      localStorage.removeItem(STORAGE_KEY);

      return null;
    }

    const validTasks = parsedTasks.filter(isStoredGenerationTask);

    if (validTasks.length === 0) {
      localStorage.removeItem(STORAGE_KEY);

      return null;
    }

    return validTasks;
  } catch {
    localStorage.removeItem(STORAGE_KEY);

    return null;
  }
}

function isStoredGenerationTask(value: unknown): value is GenerationTask {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isGenerationType(value.type) &&
    isTaskStatus(value.status) &&
    typeof value.prompt === "string" &&
    isGenerationModelRef(value.model) &&
    typeof value.progress === "number" &&
    typeof value.credits === "number" &&
    typeof value.estimatedDurationSec === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isGenerationModelRef(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isOptionalString(value.version) &&
    isOptionalString(value.provider)
  );
}

function isGenerationType(value: unknown): value is GenType {
  return typeof value === "string" && GEN_TYPES.includes(value as GenType);
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus);
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
