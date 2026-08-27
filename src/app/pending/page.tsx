import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { getSessionProfile } from "@/lib/auth";
import { canEnterWorker } from "@/lib/access";

export default async function PendingPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile && canEnterWorker(profile.access_status)) redirect("/workspaces");

  return (
    <main className="auth-page">
      <div className="pending-brand">eAmericanEnglish Worker</div>
      <section className="pending-card">
        <div className="pending-icon">⌛</div>
        <h1>Access requested</h1>
        <p>Your Google account was received.</p>
        <p>An administrator needs to approve your access before you can enter the workspace.</p>
        <span className="status-pill">Pending approval</span>
        <SignOutButton />
      </section>
    </main>
  );
}
