import { describe, expect, it } from "vitest";
import { selectWanModel, validateVideoGenerationInput } from "./wan";

const baseInput = { prompt: "A calm cinematic sunrise", aspectRatio: "16:9" as const };

describe("Wan2.2 model routing", () => {
  it("uses the 5B model for prompt and optional image generation", () => {
    expect(selectWanModel(baseInput).model).toBe("Wan2.2-TI2V-5B");
    expect(selectWanModel({ ...baseInput, referenceImageUrl: "https://files.example/image.png" }).model)
      .toBe("Wan2.2-TI2V-5B");
  });

  it("uses S2V for audio and Animate for reference motion", () => {
    expect(selectWanModel({ ...baseInput, audioUrl: "https://files.example/song.wav" }).model)
      .toBe("Wan2.2-S2V-14B");
    expect(selectWanModel({ ...baseInput, referenceVideoUrl: "https://files.example/motion.mp4" }).model)
      .toBe("Wan2.2-Animate-14B");
  });

  it("validates prompts and custom dimensions", () => {
    expect(validateVideoGenerationInput({ prompt: " ", aspectRatio: "16:9" })).toContain("A prompt is required.");
    expect(validateVideoGenerationInput({ prompt: "test", aspectRatio: "custom", width: 1919, height: 1080 }))
      .toEqual(expect.arrayContaining(["Custom width must be divisible by 32.", "Custom height must be divisible by 32."]));
  });
});
