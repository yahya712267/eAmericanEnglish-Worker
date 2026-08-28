import { describe, expect, it } from "vitest";
import {
  deriveNextVersionShell,
  rejectedSceneIds,
  setSceneDecision,
  validateGeneratorInputs,
  type VideoVersion,
} from "./video-generator";

const version: VideoVersion = {
  id: "version-1",
  number: 1,
  createdAt: "2026-08-28T00:00:00.000Z",
  windows: ["W1", "W2"],
  scenes: [
    { id: "scene-1", title: "Scene 1", startSeconds: 0, endSeconds: 4, decision: "approved", history: "new", selected: false },
    { id: "scene-2", title: "Scene 2", startSeconds: 4, endSeconds: 8, decision: "rejected", history: "new", selected: true },
  ],
};

describe("video generator state", () => {
  it("requires audio, timing JSON, and creative direction but not a reference video", () => {
    expect(validateGeneratorInputs({
      referenceVideoName: null,
      audioName: "song.wav",
      timingJsonName: "timing.json",
      aspectRatio: "16:9 Landscape",
      quality: "1080p Full HD",
      creativeDirection: "Create a cinematic performance video.",
    })).toEqual([]);
  });

  it("allows decisions to be changed", () => {
    const changed = setSceneDecision(version, "scene-1", "rejected");
    expect(changed.scenes[0].decision).toBe("rejected");
  });

  it("creates a non-destructive next-version shell with history markers", () => {
    expect(rejectedSceneIds(version)).toEqual(["scene-2"]);
    const next = deriveNextVersionShell(version);
    expect(next.number).toBe(2);
    expect(next.scenes[0].history).toBe("carried-forward");
    expect(next.scenes[1].history).toBe("previously-rejected");
    expect(next.scenes.every((scene) => scene.decision === "neutral")).toBe(true);
  });
});
