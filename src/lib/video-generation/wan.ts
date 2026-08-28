import type { VideoGenerationInput } from "./provider";

export type WanModel = "Wan2.2-TI2V-5B" | "Wan2.2-S2V-14B" | "Wan2.2-Animate-14B";

export type WanRoute = {
  model: WanModel;
  minimumVramGb: 24 | 80;
  reason: string;
};

export function selectWanModel(input: VideoGenerationInput): WanRoute {
  if (input.audioUrl) {
    return {
      model: "Wan2.2-S2V-14B",
      minimumVramGb: 80,
      reason: "Audio-driven generation uses Wan2.2 Speech-to-Video.",
    };
  }

  if (input.referenceVideoUrl) {
    return {
      model: "Wan2.2-Animate-14B",
      minimumVramGb: 80,
      reason: "Reference-motion video uses Wan2.2 Animate.",
    };
  }

  return {
    model: "Wan2.2-TI2V-5B",
    minimumVramGb: 24,
    reason: input.referenceImageUrl
      ? "Prompt and image generation uses Wan2.2 Text-Image-to-Video."
      : "Prompt-only generation uses Wan2.2 Text-Image-to-Video.",
  };
}

export function validateVideoGenerationInput(input: VideoGenerationInput): string[] {
  const errors: string[] = [];
  if (!input.prompt.trim()) errors.push("A prompt is required.");
  if (input.aspectRatio === "custom") {
    if (!input.width || !input.height) errors.push("Custom dimensions require width and height.");
    if (input.width && input.width % 32 !== 0) errors.push("Custom width must be divisible by 32.");
    if (input.height && input.height % 32 !== 0) errors.push("Custom height must be divisible by 32.");
  }
  return errors;
}
