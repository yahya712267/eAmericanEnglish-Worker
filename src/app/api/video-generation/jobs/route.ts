import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { canEnterWorker } from "@/lib/access";
import { createVideoGenerationProvider } from "@/lib/video-generation/runpod";

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5", "custom"]),
  durationSeconds: z.number().min(1).max(5).optional(),
  referenceImageUrl: z.url().optional(),
});

export async function POST(request: Request) {
  const { user, profile } = await getSessionProfile();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!profile || !canEnterWorker(profile.access_status)) {
    return NextResponse.json({ error: "Approved Worker access required." }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid generation request." }, { status: 400 });

  try {
    const job = await createVideoGenerationProvider().submit(parsed.data);
    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation submission failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
