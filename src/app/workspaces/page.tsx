import { AppShell } from "@/components/app-shell";
import { WorkspaceManager } from "@/components/workspace-manager";
import { requireApproved } from "@/lib/auth";
import type { Workspace } from "@/lib/types";

export default async function WorkspacesPage() {
  const { supabase, profile } = await requireApproved();
  const { data } = await supabase.from("workspaces").select("*").order("created_at", { ascending: true });
  return <AppShell profile={profile} active="workspaces"><main className="main-content"><WorkspaceManager initialWorkspaces={(data ?? []) as Workspace[]} /></main></AppShell>;
}
