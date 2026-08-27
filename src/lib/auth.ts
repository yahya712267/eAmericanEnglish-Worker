import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { canEnterWorker } from "@/lib/access";

export async function getSessionProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile: data as Profile | null };
}

export async function requireApproved() {
  const context = await getSessionProfile();
  if (!context.user) redirect("/login");
  if (!context.profile || !canEnterWorker(context.profile.access_status)) {
    redirect("/pending");
  }
  return context as typeof context & { profile: Profile };
}

export async function requireOwner() {
  const context = await requireApproved();
  if (context.profile.access_status !== "owner") redirect("/workspaces");
  return context;
}
