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
      <div className="auth-brand"><span className="auth-brand-left">eAmericanEnglish</span><span>Worker</span></div>
      <section className="pending-card">
        <div className="pending-icon">⌛</div>
        <h1>Approval pending</h1>
        <p>Your account is waiting for owner approval.</p>
        <span className="status-pill">Pending</span>
        <p className="subtle">You’ll be able to enter Worker after the owner approves your access.</p>
        <SignOutButton />
      </section>
    </main>
  );
}
