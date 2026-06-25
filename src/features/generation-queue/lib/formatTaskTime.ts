import {
  TASK_STATUS,
  type GenerationTask,
  type TaskStatus,
} from "@/entities/generation-task";

import { formatEta } from "./formatEta";

export function formatTaskTime(task: GenerationTask, nowMs: number) {
  if (task.status === TASK_STATUS.running && task.startedAt) {
    return formatElapsedTime(getElapsedSeconds(task.startedAt, nowMs));
  }

  if (isFinishedStatus(task.status) && task.startedAt && task.finishedAt) {
    return formatElapsedTime(getDurationSeconds(task.startedAt, task.finishedAt));
  }

  return formatEta(task.estimatedDurationSec);
}

export function isTaskTimeLive(status: TaskStatus) {
  return status === TASK_STATUS.running;
}

function isFinishedStatus(status: TaskStatus) {
  return (
    status === TASK_STATUS.done ||
    status === TASK_STATUS.failed ||
    status === TASK_STATUS.canceled
  );
}

function getElapsedSeconds(startedAt: string, nowMs: number) {
  return Math.max(0, Math.floor((nowMs - new Date(startedAt).getTime()) / 1000));
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
