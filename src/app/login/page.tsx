import { redirect } from "next/navigation";
import { GoogleSignIn } from "@/components/google-sign-in";
import { getSessionProfile } from "@/lib/auth";
import { canEnterWorker } from "@/lib/access";

export default async function LoginPage() {
  const { user, profile } = await getSessionProfile();
  if (user && profile && canEnterWorker(profile.access_status)) redirect("/workspaces");
  if (user) redirect("/pending");

  return (
    <main className="auth-page">
      <div className="auth-brand"><span className="auth-brand-left">eAmericanEnglish</span><span>Worker</span></div>
      <section className="login-card">
        <h1>Welcome to Worker</h1>
        <p className="subtle">Sign in to access your workspace</p>
        <GoogleSignIn />
        <p className="login-note">Access is limited to approved team members.</p>
      </section>
    </main>
  );
}
