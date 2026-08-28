import type {
  VideoGenerationInput,
  VideoGenerationJob,
  VideoGenerationProvider,
} from "./provider";
import { createGenerationPlan } from "./prompt-director";

type RunPodResponse = {
  id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMED_OUT";
  executionTime?: number;
  output?: { video_base64?: string; content_type?: string; error?: string };
  error?: string;
};

export class RunPodWanProvider implements VideoGenerationProvider {
  readonly name = "runpod-wan22";

  constructor(
    private readonly endpointId: string,
    private readonly apiKey: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  async submit(input: VideoGenerationInput): Promise<VideoGenerationJob> {
    const plan = createGenerationPlan(input);
    const response = await this.request(`https://api.runpod.ai/v2/${this.endpointId}/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: plan.prompt,
          negative_prompt: plan.negativePrompt,
          size: plan.size,
          frame_count: plan.frameCount,
          fps: plan.fps,
          seed: plan.seed,
          reference_image_url: input.referenceImageUrl,
        },
      }),
    });

    if (!response.ok) throw new Error(`RunPod submission failed (${response.status}).`);
    return mapRunPodJob(await response.json() as RunPodResponse, this.name);
  }

  async getJob(id: string): Promise<VideoGenerationJob> {
    const response = await this.request(`https://api.runpod.ai/v2/${this.endpointId}/status/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`RunPod status check failed (${response.status}).`);
    return mapRunPodJob(await response.json() as RunPodResponse, this.name);
  }
}

function mapRunPodJob(job: RunPodResponse, provider: string): VideoGenerationJob {
  const status = job.status === "COMPLETED"
    ? "succeeded"
    : job.status === "IN_PROGRESS"
      ? "running"
      : job.status === "IN_QUEUE"
        ? "queued"
        : "failed";
  const contentType = job.output?.content_type ?? "video/mp4";

  return {
    id: job.id,
    provider,
    status,
    executionTimeMs: job.executionTime,
    outputUrl: job.output?.video_base64
      ? `data:${contentType};base64,${job.output.video_base64}`
      : undefined,
    error: job.output?.error ?? job.error ?? (status === "failed" ? `RunPod job ended with ${job.status}.` : undefined),
  };
}

export function createVideoGenerationProvider(): VideoGenerationProvider {
  const endpointId = process.env.RUNPOD_WAN_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;
  if (!endpointId || !apiKey) throw new Error("Self-hosted Wan endpoint is not configured.");
  return new RunPodWanProvider(endpointId, apiKey);
}
