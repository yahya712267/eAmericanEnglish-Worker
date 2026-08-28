import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { canEnterWorker } from "@/lib/access";
import { createVideoGenerationProvider } from "@/lib/video-generation/runpod";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, profile } = await getSessionProfile();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!profile || !canEnterWorker(profile.access_status)) {
    return NextResponse.json({ error: "Approved Worker access required." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    return NextResponse.json(await createVideoGenerationProvider().getJob(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation status check failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
