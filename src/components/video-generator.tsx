"use client";

import { useState } from "react";
import {
  createDemoVersion,
  decideScene,
  decideSelected,
  regenerateVersion,
  type DemoVersion,
  type SceneDecision,
} from "@/lib/video-generator";

const aspectRatios = ["16:9 Landscape", "9:16 Vertical", "1:1 Square", "4:5 Portrait", "Custom"];
const qualities = ["720p HD", "1080p Full HD", "1440p QHD", "4K UHD"];
const exportFormats = [
  ["MP4 · H.264", "Ready to use"],
  ["MP4 · H.265 / HEVC", "Smaller file"],
  ["WebM · VP9", "Web delivery"],
  ["MOV · ProRes 422 HQ", "Professional editing"],
  ["MOV · ProRes 4444", "Alpha / high quality"],
  ["MXF · DNxHR HQX", "Professional editing"],
  ["PNG image sequence", "Frames"],
  ["EXR image sequence", "HDR / VFX"],
];

type ModalState = { type: "options" | "export"; versionId: number } | null;

function FileDrop({ label, optional, accept }: { label: string; optional?: boolean; accept: string }) {
  const [fileName, setFileName] = useState("");
  return (
    <label className={`vg-file-field ${fileName ? "has-file" : ""}`}>
      <span className="vg-field-label">{label}{optional && <small>Optional</small>}</span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
      />
      <span className="vg-drop">
        <span className="vg-upload-icon">↑</span>
        <strong>{fileName || `Select ${label.toLowerCase()}`}</strong>
        <span>{fileName ? "Selected for this preview" : accept.replaceAll(",", " · ")}</span>
        <em>{fileName ? "Choose a different file" : "Browse files"}</em>
      </span>
    </label>
  );
}

function SceneCard({ versionId, scene, onChange, onToggle }: {
  versionId: number;
  scene: DemoVersion["scenes"][number];
  onChange: (decision: Exclude<SceneDecision, "neutral">) => void;
  onToggle: () => void;
}) {
  const originLabel = scene.origin === "regenerated" ? "Regenerated · previously rejected" : scene.origin === "carried" ? "Carried forward" : "";
  return (
    <article className={`vg-scene ${scene.decision}`}>
      <button className={`vg-scene-select ${scene.selected ? "selected" : ""}`} onClick={onToggle} aria-pressed={scene.selected} aria-label={`Select Scene ${scene.number} in Version ${versionId}`}>{scene.selected ? "✓" : ""}</button>
      <button className="vg-scene-preview" aria-label={`Preview Scene ${scene.number}`}><span>▶</span><i /></button>
      <div className="vg-scene-copy">
        <strong>Scene {String(scene.number).padStart(2, "0")}</strong>
        <span>{scene.start}–{scene.end}</span>
        {originLabel && <em className={scene.origin}>{originLabel}</em>}
      </div>
      <div className="vg-scene-actions">
        <button className={scene.decision === "approved" ? "approved" : ""} onClick={() => onChange("approved")}>{scene.decision === "approved" ? "Approved" : "Approve"}</button>
        <button className={scene.decision === "rejected" ? "rejected" : ""} onClick={() => onChange("rejected")}>{scene.decision === "rejected" ? "Rejected" : "Reject"}</button>
      </div>
    </article>
  );
}

export function VideoGenerator() {
  const [aspectRatio, setAspectRatio] = useState("16:9 Landscape");
  const [quality, setQuality] = useState("1080p Full HD");
  const [versions, setVersions] = useState<DemoVersion[]>([]);
  const [activeWindows, setActiveWindows] = useState<Record<number, number>>({});
  const [syncScroll, setSyncScroll] = useState(true);
  const [playingAll, setPlayingAll] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState("");

  function updateVersion(versionId: number, update: (version: DemoVersion) => DemoVersion) {
    setVersions((current) => current.map((version) => version.id === versionId ? update(version) : version));
  }

  function generateDemo() {
    setVersions([createDemoVersion()]);
    setNotice("Frontend preview created. No AI generation or backend processing has occurred.");
  }

  function regenerate(source: DemoVersion) {
    const next = regenerateVersion(source, versions.length + 1);
    if (!next) {
      setNotice("Reject at least one scene before creating the next demo version.");
      return;
    }
    setVersions((current) => [...current, next]);
    setNotice(`Version ${next.id} is a local frontend preview. Rejected scenes are marked as regenerated; no backend was called.`);
  }

  function backendNotice(action: string) {
    setModal(null);
    setNotice(`${action} is not connected in this frontend milestone. Nothing was uploaded, downloaded, or exported.`);
  }

  return (
    <main className="vg-page">
      <h1>Video Generator</h1>

      <section className="vg-panel vg-inputs">
        <h2>Inputs</h2>
        <div className="vg-file-grid">
          <FileDrop label="Reference video" optional accept=".mp4,.mov,.webm" />
          <FileDrop label="Audio / Song" accept=".mp3,.wav,.m4a" />
          <FileDrop label="Timing JSON" accept=".json" />
        </div>
      </section>

      <section className="vg-panel vg-format">
        <h2>Video format</h2>
        <h3>Aspect ratio</h3>
        <div className="vg-choice-row">
          {aspectRatios.map((ratio) => <button key={ratio} className={ratio === aspectRatio ? "selected" : ""} onClick={() => setAspectRatio(ratio)}>{ratio}</button>)}
        </div>
        {aspectRatio === "Custom" && <div className="vg-custom-size"><label>Width <input inputMode="numeric" placeholder="1920" /></label><span>×</span><label>Height <input inputMode="numeric" placeholder="1080" /></label></div>}
        <h3>Quality</h3>
        <div className="vg-choice-row quality">
          {qualities.map((item) => <button key={item} className={item === quality ? "selected" : ""} onClick={() => setQuality(item)}>{item}</button>)}
        </div>
      </section>

      <section className="vg-panel vg-creative">
        <h2>Creative direction</h2>
        <textarea aria-label="Prompt" placeholder="Describe the video you want. ChatGPT will turn your direction into the generation prompt." />
        <button className="vg-generate" onClick={generateDemo}>Generate Full Video</button>
        <p className="vg-demo-disclaimer">Frontend preview only — this does not generate a real AI video.</p>
      </section>

      {notice && <div className="vg-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

      {versions.length > 0 && (
        <section className="vg-comparison">
          <div className="vg-comparison-heading">
            <div><h2>Version comparison</h2><p>Compare complete versions side by side. Keep the good parts, reject the rest, and generate the next version.</p></div>
            <div className="vg-sync-controls">
              <label><input type="checkbox" checked={syncScroll} onChange={(event) => setSyncScroll(event.target.checked)} /> Sync scene scroll</label>
              <button className={playingAll ? "playing" : ""} onClick={() => setPlayingAll((value) => !value)}>{playingAll ? "Pause all" : "Play all in sync"}</button>
            </div>
          </div>
          <div className="vg-versions" data-sync-scroll={syncScroll}>
            {versions.map((version, index) => (
              <article className={`vg-version ${index === versions.length - 1 ? "current" : ""}`} key={version.id}>
                <h3>Version {version.id}</h3>
                <p className="vg-version-status">{version.id === 1 ? "Original" : index === versions.length - 1 ? "Current" : "Previous"}</p>
                <button className={`vg-player ${playingAll ? "playing" : ""}`} aria-label={`${playingAll ? "Pause" : "Play"} Version ${version.id}`} onClick={() => setPlayingAll((value) => !value)}><span>{playingAll ? "Ⅱ" : "▶"}</span><i>Frontend preview</i></button>
                <div className="vg-timeline"><span /></div><small>00:18 / 00:42</small>
                <div className="vg-window-row">
                  {[1, 2, 3, 4].map((window) => <button key={window} className={(activeWindows[version.id] ?? 1) === window ? "selected" : ""} onClick={() => setActiveWindows((value) => ({ ...value, [version.id]: window }))}>W{window}</button>)}
                  <button className="vg-more" onClick={() => setModal({ type: "options", versionId: version.id })} aria-label={`Version ${version.id} options`}>•••</button>
                </div>
                <div className="vg-scenes">
                  {version.scenes.map((scene) => <SceneCard key={scene.id} versionId={version.id} scene={scene} onToggle={() => updateVersion(version.id, (item) => ({ ...item, scenes: item.scenes.map((candidate) => candidate.id === scene.id ? { ...candidate, selected: !candidate.selected } : candidate) }))} onChange={(decision) => updateVersion(version.id, (item) => decideScene(item, scene.id, decision))} />)}
                </div>
                <div className="vg-bulk-actions">
                  <button onClick={() => updateVersion(version.id, (item) => decideSelected(item, "approved"))}>Approve selected</button>
                  <button onClick={() => updateVersion(version.id, (item) => decideSelected(item, "rejected"))}>Reject selected</button>
                </div>
                <button className="vg-regenerate" onClick={() => regenerate(version)}>Regenerate rejected</button>
              </article>
            ))}
          </div>
          {versions.length > 3 && <p className="vg-scroll-hint">Scroll horizontally to compare more versions.</p>}
        </section>
      )}

      {modal && <div className="vg-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        {modal.type === "options" ? (
          <div className="vg-version-modal" role="dialog" aria-modal="true" aria-label={`Version ${modal.versionId} options`}>
            <h2>Version options</h2><button className="vg-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button>
            <button onClick={() => backendNotice("Download")}>↓ <strong>Download</strong></button>
            <button onClick={() => backendNotice("Upload to Google Drive")}>△ <strong>Upload to Google Drive</strong></button>
            <button onClick={() => setModal({ ...modal, type: "export" })}>→ <strong>Export as</strong></button>
            <button onClick={() => backendNotice("Editor package export")}>→ <strong>Editor package</strong></button>
          </div>
        ) : (
          <div className="vg-export-modal" role="dialog" aria-modal="true" aria-label="Export as">
            <h2>Export as</h2><button className="vg-export-back" onClick={() => setModal({ ...modal, type: "options" })}>← Back</button>
            <div>{exportFormats.map(([name, description]) => <button key={name} onClick={() => backendNotice(`${name} export`)}><strong>{name}</strong><span>{description}</span></button>)}</div>
          </div>
        )}
      </div>}
    </main>
  );
}
