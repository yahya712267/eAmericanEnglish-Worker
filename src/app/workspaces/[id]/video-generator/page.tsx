import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VideoGenerator } from "@/components/video-generator";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { requireApproved } from "@/lib/auth";
import type { Workspace } from "@/lib/types";

export default async function VideoGeneratorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireApproved();
  const [{ data: current }, { data: workspaces }] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", id).single(),
    supabase.from("workspaces").select("*").order("created_at", { ascending: true }),
  ]);

  if (!current) notFound();

  return (
    <AppShell
      profile={profile}
      active="workspace"
      sidebarContent={
        <WorkspaceSidebar
          current={current as Workspace}
          workspaces={(workspaces ?? []) as Workspace[]}
          profile={profile}
          activeProduct="Video Generator"
        />
      }
    >
      <VideoGenerator workspaceId={id} />
    </AppShell>
  );
}
