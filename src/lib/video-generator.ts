export type SceneDecision = "neutral" | "approved" | "rejected";
export type SceneOrigin = "original" | "regenerated" | "carried";

export type DemoScene = {
  id: string;
  number: number;
  start: string;
  end: string;
  decision: SceneDecision;
  selected: boolean;
  origin: SceneOrigin;
};

export type DemoVersion = {
  id: number;
  scenes: DemoScene[];
  videoUrl?: string;
};

const demoTimings = [
  ["00:00", "00:06"],
  ["00:06", "00:12"],
  ["00:12", "00:18"],
];

export function createDemoVersion(id = 1, videoUrl?: string): DemoVersion {
  return {
    id,
    videoUrl,
    scenes: demoTimings.map(([start, end], index) => ({
      id: `v${id}-scene-${index + 1}`,
      number: index + 1,
      start,
      end,
      decision: "neutral",
      selected: false,
      origin: "original",
    })),
  };
}

export function decideScene(version: DemoVersion, sceneId: string, decision: Exclude<SceneDecision, "neutral">): DemoVersion {
  return {
    ...version,
    scenes: version.scenes.map((scene) =>
      scene.id === sceneId
        ? { ...scene, decision: scene.decision === decision ? "neutral" : decision }
        : scene,
    ),
  };
}

export function decideSelected(version: DemoVersion, decision: Exclude<SceneDecision, "neutral">): DemoVersion {
  return {
    ...version,
    scenes: version.scenes.map((scene) =>
      scene.selected ? { ...scene, decision, selected: false } : scene,
    ),
  };
}

export function regenerateVersion(version: DemoVersion, nextId: number): DemoVersion | null {
  if (!version.scenes.some((scene) => scene.decision === "rejected")) return null;
  return {
    id: nextId,
    scenes: version.scenes.map((scene) => ({
      ...scene,
      id: `v${nextId}-scene-${scene.number}`,
      decision: scene.decision === "approved" ? "approved" : "neutral",
      selected: false,
      origin: scene.decision === "rejected" ? "regenerated" : "carried",
    })),
  };
}
