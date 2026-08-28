import type { VideoGenerationInput } from "./provider";

export type GenerationPlan = {
  prompt: string;
  negativePrompt: string;
  frameCount: number;
  fps: 24;
  size: "1280*704" | "704*1280";
  seed: number;
};

export function createGenerationPlan(input: VideoGenerationInput): GenerationPlan {
  const direction = input.prompt.trim().replace(/\s+/g, " ");
  const portrait = input.aspectRatio === "9:16" || input.aspectRatio === "4:5";
  const requestedSeconds = Math.min(Math.max(input.durationSeconds ?? 3, 1), 5);
  const rawFrames = Math.round(requestedSeconds * 24);
  const frameCount = Math.max(25, Math.floor((rawFrames - 1) / 4) * 4 + 1);

  return {
    prompt: `${direction}. Cinematic composition, coherent motion, consistent subjects, natural lighting, high detail.`,
    negativePrompt: "text overlays, subtitles, watermark, logo, distorted anatomy, flicker, duplicate subjects",
    frameCount,
    fps: 24,
    size: portrait ? "704*1280" : "1280*704",
    seed: 42,
  };
}
