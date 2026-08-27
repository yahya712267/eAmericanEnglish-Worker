import { AccessManager } from "@/components/access-manager";
import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export default async function UsersPage() {
  const { supabase, profile } = await requireOwner();
  const { data } = await supabase.from("profiles").select("*").neq("access_status", "owner").order("created_at", { ascending: true });
  return <AppShell profile={profile} active="users"><main className="main-content"><AccessManager initialProfiles={(data ?? []) as Profile[]} /></main></AppShell>;
}
