export type VideoAspectRatio = "16:9" | "9:16" | "1:1" | "4:5" | "custom";

export type VideoGenerationInput = {
  prompt: string;
  aspectRatio: VideoAspectRatio;
  width?: number;
  height?: number;
  durationSeconds?: number;
  referenceImageUrl?: string;
  referenceVideoUrl?: string;
  audioUrl?: string;
};

export type VideoGenerationJob = {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  provider: string;
  outputUrl?: string;
  executionTimeMs?: number;
  error?: string;
};

/**
 * Application-facing boundary for generation compute. Implementations may run on
 * a local GPU host or infrastructure owned by eAmericanEnglish.
 */
export interface VideoGenerationProvider {
  readonly name: string;
  submit(input: VideoGenerationInput): Promise<VideoGenerationJob>;
  getJob(id: string): Promise<VideoGenerationJob>;
}
