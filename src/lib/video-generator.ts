export const VIDEO_ASPECT_RATIOS = [
  "16:9 Landscape",
  "9:16 Vertical",
  "1:1 Square",
  "4:5 Portrait",
  "Custom",
] as const;

export const VIDEO_QUALITIES = [
  "720p HD",
  "1080p Full HD",
  "1440p QHD",
  "4K UHD",
] as const;

export type VideoAspectRatio = (typeof VIDEO_ASPECT_RATIOS)[number];
export type VideoQuality = (typeof VIDEO_QUALITIES)[number];
export type SceneDecision = "neutral" | "approved" | "rejected";
export type SceneHistory = "new" | "previously-rejected" | "carried-forward";

export type VideoGeneratorInputs = {
  referenceVideoName: string | null;
  audioName: string | null;
  timingJsonName: string | null;
  aspectRatio: VideoAspectRatio;
  quality: VideoQuality;
  creativeDirection: string;
};

export type PromptDirectorRequest = VideoGeneratorInputs & {
  workspaceId: string;
};

export type DirectedGenerationPlan = {
  userDirection: string;
  productionPrompt: string;
  aspectRatio: VideoAspectRatio;
  quality: VideoQuality;
  referenceVideoName: string | null;
  audioName: string;
  timingJsonName: string;
};

export type ReviewScene = {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  decision: SceneDecision;
  history: SceneHistory;
  selected: boolean;
  previewUrl?: string;
};

export type VideoVersion = {
  id: string;
  number: number;
  createdAt: string;
  videoUrl?: string;
  durationSeconds?: number;
  windows: string[];
  scenes: ReviewScene[];
};

export interface VideoGenerationProvider {
  generateFullVideo(plan: DirectedGenerationPlan): Promise<VideoVersion>;
  regenerateRejectedScenes(args: {
    plan: DirectedGenerationPlan;
    sourceVersion: VideoVersion;
    rejectedSceneIds: string[];
  }): Promise<VideoVersion>;
}

export function validateGeneratorInputs(inputs: VideoGeneratorInputs) {
  const errors: string[] = [];
  if (!inputs.audioName) errors.push("Add an audio or song file.");
  if (!inputs.timingJsonName) errors.push("Add a timing JSON file.");
  if (!inputs.creativeDirection.trim()) errors.push("Describe the creative direction.");
  return errors;
}

export function setSceneDecision(
  version: VideoVersion,
  sceneId: string,
  decision: SceneDecision,
): VideoVersion {
  return {
    ...version,
    scenes: version.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, decision } : scene,
    ),
  };
}

export function setSelectedSceneDecision(
  version: VideoVersion,
  decision: Exclude<SceneDecision, "neutral">,
): VideoVersion {
  return {
    ...version,
    scenes: version.scenes.map((scene) =>
      scene.selected ? { ...scene, decision } : scene,
    ),
  };
}

export function rejectedSceneIds(version: VideoVersion) {
  return version.scenes
    .filter((scene) => scene.decision === "rejected")
    .map((scene) => scene.id);
}

export function deriveNextVersionShell(source: VideoVersion): VideoVersion {
  const rejected = new Set(rejectedSceneIds(source));
  return {
    ...source,
    id: `version-${source.number + 1}`,
    number: source.number + 1,
    createdAt: new Date().toISOString(),
    videoUrl: undefined,
    scenes: source.scenes.map((scene) => ({
      ...scene,
      decision: "neutral",
      selected: false,
      history: rejected.has(scene.id) ? "previously-rejected" : "carried-forward",
    })),
  };
}
