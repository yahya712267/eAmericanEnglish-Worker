import { describe, expect, it, vi } from "vitest";
import { RunPodWanProvider } from "./runpod";

describe("RunPod Wan provider", () => {
  it("submits a directed Wan job without exposing credentials in its result", async () => {
    let submittedOptions: RequestInit | undefined;
    const request = vi.fn<typeof fetch>(async (...args) => {
      submittedOptions = args[1];
      return new Response(JSON.stringify({ id: "job-1", status: "IN_QUEUE" }), { status: 200 });
    });
    const provider = new RunPodWanProvider("endpoint", "secret", request);
    const job = await provider.submit({ prompt: "A sunrise", aspectRatio: "16:9", durationSeconds: 2 });
    expect(job).toMatchObject({ id: "job-1", status: "queued", provider: "runpod-wan22" });
    expect(submittedOptions?.body).toContain("Cinematic composition");
    expect(JSON.stringify(job)).not.toContain("secret");
  });

  it("submits 25 frames for the smallest one-second proof", async () => {
    let submittedOptions: RequestInit | undefined;
    const request = vi.fn<typeof fetch>(async (...args) => {
      submittedOptions = args[1];
      return new Response(JSON.stringify({ id: "job-min", status: "IN_QUEUE" }), { status: 200 });
    });
    const provider = new RunPodWanProvider("endpoint", "secret", request);
    await provider.submit({ prompt: "A paper airplane", aspectRatio: "16:9", durationSeconds: 1 });
    expect(JSON.parse(String(submittedOptions?.body)).input.frame_count).toBe(25);
  });

  it("maps a completed base64 result to a playable data URL", async () => {
    const request = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      id: "job-2",
      status: "COMPLETED",
      executionTime: 1234,
      output: { video_base64: "AAAA", content_type: "video/mp4" },
    }), { status: 200 }));
    const provider = new RunPodWanProvider("endpoint", "secret", request);
    await expect(provider.getJob("job-2")).resolves.toMatchObject({
      status: "succeeded",
      outputUrl: "data:video/mp4;base64,AAAA",
      executionTimeMs: 1234,
    });
  });
});
