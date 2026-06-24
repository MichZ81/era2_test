import {
  TASK_STATUS,
  type GenerationTask,
  type GenerationTaskError,
  type GenerationTaskId,
  type GenType,
} from "@/entities/generation-task";

/** Максимальное количество задач, которые могут выполняться одновременно. */
export const MAX_CONCURRENT = 2;

/** Вероятность единичного сбоя для задачи во время выполнения. */
const DEFAULT_FAILURE_RATE = 0.15;

/** Минимальная задержка между тиками прогресса. */
const MIN_TICK_DELAY_MS = 400;

/** Максимальная задержка между тиками прогресса. */
const MAX_TICK_DELAY_MS = 700;

/** Базовая длительность генерации по типу задачи, если задача не задает свою оценку. */
const DEFAULT_DURATION_BY_TYPE: Record<GenType, number> = {
  text: 18,
  image: 35,
  audio: 140,
  video: 210,
};

/** Набор пользовательских ошибок, которыми мок-движок имитирует сбои. */
const FAILURE_ERRORS: GenerationTaskError[] = [
  {
    code: "insufficient_credits",
    message: "Недостаточно кредитов",
  },
  {
    code: "timeout",
    message: "Превышено время ожидания",
  },
  {
    code: "model_unavailable",
    message: "Модель временно недоступна",
  },
];

/** События, которые движок отправляет в единый источник состояния очереди. */
export type QueueEngineAction =
  | {
      type: "queue/taskStarted";
      payload: {
        id: GenerationTaskId;
        startedAt: string;
      };
    }
  | {
      type: "queue/taskProgressed";
      payload: {
        id: GenerationTaskId;
        progress: number;
        updatedAt: string;
      };
    }
  | {
      type: "queue/taskCompleted";
      payload: {
        id: GenerationTaskId;
        finishedAt: string;
      };
    }
  | {
      type: "queue/taskFailed";
      payload: {
        id: GenerationTaskId;
        error: GenerationTaskError;
        failedAt: string;
      };
    };

/** Функция отправки событий движка в редьюсер очереди. */
export type QueueEngineDispatch = (action: QueueEngineAction) => void;

/** Настройки мок-движка очереди. */
export interface QueueEngineOptions {
  /** Возвращает актуальный снимок задач из состояния приложения. */
  getTasks: () => readonly GenerationTask[];

  /** Отправляет событие движка в редьюсер очереди. */
  dispatch: QueueEngineDispatch;

  /** Генератор случайных чисел, вынесенный для тестов и предсказуемых сценариев. */
  random?: () => number;

  /** Возвращает текущее время, вынесенное для тестов и детерминированных дат. */
  now?: () => Date;

  /** Вероятность сбоя задачи при планировании ее выполнения. */
  failureRate?: number;
}

/** Публичный контракт мок-движка очереди. */
export interface QueueEngine {
  /** Запускает движок и синхронизирует его с текущим состоянием очереди. */
  start: () => void;

  /** Останавливает движок и очищает все активные таймеры. */
  stop: () => void;

  /** Синхронизирует таймеры, слоты выполнения и очередь с актуальными задачами. */
  sync: (tasks?: readonly GenerationTask[]) => void;

  /** Останавливает таймер конкретной задачи сразу после пользовательской отмены. */
  cancelTask: (id: GenerationTaskId) => void;
}

/** План заранее выбранного сбоя для конкретной running-задачи. */
interface FailurePlan {
  /** Прогресс, на котором задача должна перейти в failed. */
  failAtProgress: number;

  /** Ошибка, которую увидит пользователь после сбоя. */
  error: GenerationTaskError;
}

/** Создает изолированный экземпляр мок-движка очереди. */
export function createQueueEngine(options: QueueEngineOptions): QueueEngine {
  return new ClientQueueEngine(options);
}

/** Клиентская реализация движка очереди с таймерами и ограничением слотов. */
class ClientQueueEngine implements QueueEngine {
  /** Функция чтения актуального списка задач из внешнего состояния. */
  private readonly getTasks: QueueEngineOptions["getTasks"];

  /** Функция отправки событий в редьюсер очереди. */
  private readonly dispatch: QueueEngineDispatch;

  /** Источник случайности для задержек, прогресса и сбоев. */
  private readonly random: () => number;

  /** Источник текущего времени для событий жизненного цикла задачи. */
  private readonly now: () => Date;

  /** Вероятность, что running-задача получит план сбоя. */
  private readonly failureRate: number;

  /** Флаг активности движка, защищающий от тиков после остановки. */
  private isStarted = false;

  /** Активные таймеры прогресса по идентификатору задачи. */
  private readonly timers = new Map<GenerationTaskId, number>();

  /** Задачи, для которых уже отправлен старт, но редьюсер еще не вернул running-снимок. */
  private readonly pendingStarts = new Set<GenerationTaskId>();

  /** Запланированные сбои для running-задач. */
  private readonly failurePlans = new Map<GenerationTaskId, FailurePlan>();

  /** Инициализирует зависимости движка и значения по умолчанию. */
  constructor(options: QueueEngineOptions) {
    this.getTasks = options.getTasks;
    this.dispatch = options.dispatch;
    this.random = options.random ?? Math.random;
    this.now = options.now ?? (() => new Date());
    this.failureRate = options.failureRate ?? DEFAULT_FAILURE_RATE;
  }

  /** Запускает движок один раз и сразу подхватывает доступные queued/running задачи. */
  start() {
    if (this.isStarted) {
      return;
    }

    this.isStarted = true;
    this.sync();
  }

  /** Полностью останавливает движок и очищает все внутренние планы/таймеры. */
  stop() {
    this.isStarted = false;
    this.timers.forEach((timerId) => window.clearTimeout(timerId));
    this.timers.clear();
    this.pendingStarts.clear();
    this.failurePlans.clear();
  }

  /** Сверяет внутреннее состояние движка с актуальным списком задач из стора. */
  sync(tasks = this.getTasks()) {
    if (!this.isStarted) {
      return;
    }

    /** Индекс актуальных задач, нужен для чистки таймеров исчезнувших или завершенных задач. */
    const taskById = new Map(tasks.map((task) => [task.id, task]));

    this.clearStoppedTasks(taskById);
    this.startRunningTimers(tasks);
    this.fillAvailableSlots(tasks);
  }

  /** Немедленно очищает все внутренние следы задачи после пользовательской отмены. */
  cancelTask(id: GenerationTaskId) {
    this.clearTaskTimer(id);
    this.pendingStarts.delete(id);
    this.failurePlans.delete(id);
  }

  /** Очищает таймеры и планы задач, которые больше не находятся в актуальном running/queued состоянии. */
  private clearStoppedTasks(taskById: Map<GenerationTaskId, GenerationTask>) {
    this.timers.forEach((_timerId, id) => {
      /** Актуальная версия задачи из внешнего состояния. */
      const task = taskById.get(id);

      if (!task || task.status !== TASK_STATUS.running) {
        this.clearTaskTimer(id);
      }
    });

    this.failurePlans.forEach((_plan, id) => {
      /** Актуальная версия задачи из внешнего состояния. */
      const task = taskById.get(id);

      if (!task || task.status !== TASK_STATUS.running) {
        this.failurePlans.delete(id);
      }
    });

    this.pendingStarts.forEach((id) => {
      /** Актуальная версия задачи из внешнего состояния. */
      const task = taskById.get(id);

      if (!task || task.status !== TASK_STATUS.queued) {
        this.pendingStarts.delete(id);
      }
    });
  }

  /** Запускает таймеры для задач, которые уже находятся в статусе running. */
  private startRunningTimers(tasks: readonly GenerationTask[]) {
    tasks
      .filter((task) => task.status === TASK_STATUS.running)
      .forEach((task) => {
        this.pendingStarts.delete(task.id);
        this.ensureFailurePlan(task);
        this.scheduleNextTick(task.id);
      });
  }

  /** Заполняет свободные слоты следующими queued-задачами по FIFO createdAt. */
  private fillAvailableSlots(tasks: readonly GenerationTask[]) {
    /** Текущее количество задач в работе по снимку внешнего состояния. */
    const runningCount = tasks.filter(
      (task) => task.status === TASK_STATUS.running,
    ).length;

    /** Количество свободных слотов с учетом MAX_CONCURRENT. */
    const availableSlots = Math.max(0, MAX_CONCURRENT - runningCount);

    if (availableSlots === 0) {
      return;
    }

    /** Следующие задачи, которые можно перевести из queued в running. */
    const nextQueuedTasks = tasks
      .filter(
        (task) =>
          task.status === TASK_STATUS.queued &&
          !this.pendingStarts.has(task.id),
      )
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      )
      .slice(0, availableSlots);

    nextQueuedTasks.forEach((task) => {
      this.pendingStarts.add(task.id);
      this.dispatch({
        type: "queue/taskStarted",
        payload: {
          id: task.id,
          startedAt: this.now().toISOString(),
        },
      });
    });
  }

  /** Планирует следующий тик прогресса для running-задачи, если таймер еще не активен. */
  private scheduleNextTick(id: GenerationTaskId) {
    if (this.timers.has(id)) {
      return;
    }

    /** Идентификатор таймера, который нужно очистить при cancel/stop/status change. */
    const timerId = window.setTimeout(() => {
      this.timers.delete(id);
      this.tick(id);
    }, this.getTickDelay());

    this.timers.set(id, timerId);
  }

  /** Выполняет один тик задачи: прогресс, завершение или запланированный сбой. */
  private tick(id: GenerationTaskId) {
    if (!this.isStarted) {
      return;
    }

    /** Актуальная задача на момент срабатывания таймера. */
    const task = this.getTasks().find((item) => item.id === id);

    if (!task || task.status !== TASK_STATUS.running) {
      this.clearTaskTimer(id);
      return;
    }

    /** Следующее значение прогресса с учетом типа задачи и случайного джиттера. */
    const nextProgress = this.getNextProgress(task);

    /** Запланированный сбой, если задача была выбрана для ошибки. */
    const failurePlan = this.failurePlans.get(id);

    if (failurePlan && nextProgress >= failurePlan.failAtProgress) {
      this.failurePlans.delete(id);
      this.dispatch({
        type: "queue/taskFailed",
        payload: {
          id,
          error: failurePlan.error,
          failedAt: this.now().toISOString(),
        },
      });
      return;
    }

    if (nextProgress >= 100) {
      this.failurePlans.delete(id);
      this.dispatch({
        type: "queue/taskCompleted",
        payload: {
          id,
          finishedAt: this.now().toISOString(),
        },
      });
      return;
    }

    this.dispatch({
      type: "queue/taskProgressed",
      payload: {
        id,
        progress: nextProgress,
        updatedAt: this.now().toISOString(),
      },
    });
    this.scheduleNextTick(id);
  }

  /** Рассчитывает следующий процент прогресса для задачи. */
  private getNextProgress(task: GenerationTask) {
    /** Оценка длительности задачи в секундах. */
    const durationSec =
      task.estimatedDurationSec || DEFAULT_DURATION_BY_TYPE[task.type];

    /** Базовый прирост за один тик: длинные audio/video двигаются заметно медленнее. */
    const baseStep = 100 / Math.max(1, durationSec * 2);

    /** Случайное отклонение, чтобы прогресс не выглядел механическим. */
    const jitter = 0.75 + this.random() * 0.75;

    /** Нецелое значение прогресса перед округлением и ограничением сверху. */
    const progress = task.progress + baseStep * jitter;

    return Math.min(100, Math.round(progress));
  }

  /** Один раз решает, упадет ли running-задача, и на каком прогрессе это случится. */
  private ensureFailurePlan(task: GenerationTask) {
    if (this.failurePlans.has(task.id)) {
      return;
    }

    if (this.random() >= this.failureRate) {
      return;
    }

    /** Прогресс, после которого задача будет переведена в failed. */
    const failAtProgress = Math.min(
      95,
      Math.max(task.progress + 5, 20 + Math.round(this.random() * 65)),
    );

    /** Индекс ошибки из фиксированного набора понятных сообщений. */
    const errorIndex = Math.floor(this.random() * FAILURE_ERRORS.length);

    this.failurePlans.set(task.id, {
      failAtProgress,
      error: FAILURE_ERRORS[errorIndex],
    });
  }

  /** Возвращает случайную задержку до следующего тика прогресса. */
  private getTickDelay() {
    return Math.round(
      MIN_TICK_DELAY_MS +
        this.random() * (MAX_TICK_DELAY_MS - MIN_TICK_DELAY_MS),
    );
  }

  /** Очищает активный таймер конкретной задачи, если он существует. */
  private clearTaskTimer(id: GenerationTaskId) {
    /** Идентификатор активного таймера задачи. */
    const timerId = this.timers.get(id);

    if (timerId === undefined) {
      return;
    }

    window.clearTimeout(timerId);
    this.timers.delete(id);
  }
}
