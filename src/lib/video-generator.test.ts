import { describe, expect, it } from "vitest";
import { createDemoVersion, decideScene, decideSelected, regenerateVersion } from "./video-generator";

describe("video generator prototype state", () => {
  it("keeps scene decisions reversible", () => {
    const version = createDemoVersion();
    const approved = decideScene(version, version.scenes[0].id, "approved");
    expect(approved.scenes[0].decision).toBe("approved");
    expect(decideScene(approved, approved.scenes[0].id, "approved").scenes[0].decision).toBe("neutral");
    expect(decideScene(approved, approved.scenes[0].id, "rejected").scenes[0].decision).toBe("rejected");
  });

  it("applies bulk decisions only to selected scenes", () => {
    const version = createDemoVersion();
    version.scenes[0].selected = true;
    version.scenes[2].selected = true;
    const result = decideSelected(version, "rejected");
    expect(result.scenes.map((scene) => scene.decision)).toEqual(["rejected", "neutral", "rejected"]);
    expect(result.scenes.every((scene) => !scene.selected)).toBe(true);
  });

  it("creates a new version without overwriting rejected scenes", () => {
    const original = createDemoVersion();
    original.scenes[0].decision = "rejected";
    original.scenes[1].decision = "approved";
    const next = regenerateVersion(original, 2);
    expect(next?.id).toBe(2);
    expect(next?.scenes[0]).toMatchObject({ origin: "regenerated", decision: "neutral" });
    expect(next?.scenes[1]).toMatchObject({ origin: "carried", decision: "approved" });
    expect(original.scenes[0].decision).toBe("rejected");
  });
});
