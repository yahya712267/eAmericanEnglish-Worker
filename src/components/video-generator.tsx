"use client";

import { useMemo, useState } from "react";
import styles from "./video-generator.module.css";
import {
  VIDEO_ASPECT_RATIOS,
  VIDEO_QUALITIES,
  validateGeneratorInputs,
  type VideoAspectRatio,
  type VideoQuality,
} from "@/lib/video-generator";

type FileSlotProps = {
  label: string;
  accept: string;
  format: string;
  optional?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

function FileSlot({ label, accept, format, optional, file, onChange }: FileSlotProps) {
  return (
    <label className={styles.fileSlot}>
      <span className={styles.fileLabel}>{label}{optional ? " — optional" : ""}</span>
      <span className={styles.dropZone}>
        <input
          className={styles.fileInput}
          type="file"
          accept={accept}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <strong>{file ? file.name : `Drop ${label.toLowerCase()} here`}</strong>
        <span>{file ? "Ready" : format}</span>
        <span className={styles.browse}>{file ? "Choose another file" : "Browse files"}</span>
      </span>
    </label>
  );
}

export function VideoGenerator({ workspaceId }: { workspaceId: string }) {
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [timingJson, setTimingJson] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9 Landscape");
  const [quality, setQuality] = useState<VideoQuality>("1080p Full HD");
  const [creativeDirection, setCreativeDirection] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const validationErrors = useMemo(
    () => validateGeneratorInputs({
      referenceVideoName: referenceVideo?.name ?? null,
      audioName: audio?.name ?? null,
      timingJsonName: timingJson?.name ?? null,
      aspectRatio,
      quality,
      creativeDirection,
    }),
    [referenceVideo, audio, timingJson, aspectRatio, quality, creativeDirection],
  );

  function handleGenerate() {
    if (validationErrors.length > 0) {
      setNotice(validationErrors.join(" "));
      return;
    }

    setNotice(
      `Generation request is ready for workspace ${workspaceId}. The UI and request state are implemented; the real generation provider and prompt-director API are not connected yet, so no video was falsely created.`,
    );
  }

  return (
    <main className={styles.page}>
      <h1>Video Generator</h1>

      <section className={styles.card} aria-labelledby="vg-inputs-heading">
        <h2 id="vg-inputs-heading">Inputs</h2>
        <div className={styles.inputGrid}>
          <FileSlot
            label="Reference video"
            optional
            accept="video/*"
            format="MP4, MOV, WebM"
            file={referenceVideo}
            onChange={setReferenceVideo}
          />
          <FileSlot
            label="Audio / Song"
            accept="audio/*"
            format="WAV, MP3, M4A"
            file={audio}
            onChange={setAudio}
          />
          <FileSlot
            label="Timing JSON"
            accept="application/json,.json"
            format="JSON"
            file={timingJson}
            onChange={setTimingJson}
          />
        </div>
      </section>

      <section className={styles.card} aria-labelledby="vg-format-heading">
        <h2 id="vg-format-heading">Video format</h2>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Aspect ratio</span>
          <div className={styles.optionRow}>
            {VIDEO_ASPECT_RATIOS.map((option) => (
              <button
                type="button"
                key={option}
                className={`${styles.option} ${aspectRatio === option ? styles.optionActive : ""}`}
                onClick={() => setAspectRatio(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Quality</span>
          <div className={styles.optionRow}>
            {VIDEO_QUALITIES.map((option) => (
              <button
                type="button"
                key={option}
                className={`${styles.qualityOption} ${quality === option ? styles.optionActive : ""}`}
                onClick={() => setQuality(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.card} ${styles.creativeCard}`} aria-labelledby="vg-prompt-heading">
        <h2 id="vg-prompt-heading">Creative direction</h2>
        <label className={styles.promptLabel}>
          <span>Prompt</span>
          <textarea
            value={creativeDirection}
            onChange={(event) => setCreativeDirection(event.target.value)}
            placeholder="Describe the video you want. ChatGPT will turn your direction into the generation prompt."
          />
        </label>
        <button type="button" className={styles.generateButton} onClick={handleGenerate}>
          Generate Full Video
        </button>
        {notice && <p className={styles.notice} role="status">{notice}</p>}
      </section>

      <section className={styles.reviewSection} aria-labelledby="version-comparison-heading">
        <div className={styles.reviewHeader}>
          <div>
            <h2 id="version-comparison-heading">Version comparison</h2>
            <p>Generated versions will appear here for scene review and non-destructive regeneration.</p>
          </div>
          <div className={styles.reviewControls}>
            <label><input type="checkbox" disabled /> Sync scene scroll</label>
            <button type="button" disabled>Play all in sync</button>
          </div>
        </div>
        <div className={styles.emptyReview}>
          Generate the first full video to begin comparing versions and reviewing scenes.
        </div>
      </section>
    </main>
  );
}
