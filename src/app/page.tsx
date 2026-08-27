import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { canEnterWorker } from "@/lib/access";

export default async function HomePage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || !canEnterWorker(profile.access_status)) redirect("/pending");
  redirect("/workspaces");
}
