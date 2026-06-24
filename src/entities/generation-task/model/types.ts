export const GEN_TYPES = ["text", "image", "video", "audio"] as const;

export type GenType = (typeof GEN_TYPES)[number];

export const TASK_STATUSES = [
  "queued",
  "running",
  "done",
  "failed",
  "canceled",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type GenerationTaskId = string;
export type IsoDateString = string;

export interface GenerationModelRef {
  id: string;
  name: string;
  version?: string;
  provider?: string;
}

export interface GenerationTaskResult {
  url?: string;
  fileName?: string;
  mimeType?: string;
}

export type GenerationTaskErrorCode =
  | "insufficient_credits"
  | "timeout"
  | "model_unavailable"
  | "unknown";

export interface GenerationTaskError {
  code: GenerationTaskErrorCode;
  message: string;
}

export interface GenerationTask {
  id: GenerationTaskId;
  type: GenType;
  status: TaskStatus;
  prompt: string;
  model: GenerationModelRef;
  progress: number;
  credits: number;
  estimatedDurationSec: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  queuedAt?: IsoDateString;
  startedAt?: IsoDateString;
  finishedAt?: IsoDateString;
  previewUrl?: string;
  result?: GenerationTaskResult;
  error?: GenerationTaskError;
}
