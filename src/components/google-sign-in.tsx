"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignIn() {
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    const { error: authError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) setError("Google sign-in could not be started. Please try again.");
  }

  return (
    <>
      <button className="google-button" onClick={signIn}>
        <span className="google-mark" aria-hidden="true">G</span>
        <span>Continue with Google</span>
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </>
  );
}
