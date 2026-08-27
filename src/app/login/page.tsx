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
      <div className="login-brand">eAmericanEnglish Worker</div>
      <section className="login-card">
        <h1>Welcome back</h1>
        <p className="subtle">Sign in to eAmericanEnglish Worker</p>
        <GoogleSignIn />
        <p className="login-note">Only approved Google accounts can enter.</p>
      </section>
    </main>
  );
}
