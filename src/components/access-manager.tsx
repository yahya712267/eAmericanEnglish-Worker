"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AccessStatus, Profile } from "@/lib/types";

export function AccessManager({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(profile: Profile, access_status: AccessStatus) {
    setBusyId(profile.id); setError(null);
    const { data, error: requestError } = await createClient().from("profiles").update({ access_status }).eq("id", profile.id).select().single();
    if (requestError) setError(requestError.message);
    else setProfiles((items) => items.map((item) => item.id === profile.id ? data as Profile : item));
    setBusyId(null);
  }

  const pending = profiles.filter((profile) => profile.access_status === "pending");
  const approved = profiles.filter((profile) => profile.access_status === "approved");

  return (
    <>
      <h1 className="page-heading">Users &amp; Access</h1>
      <p className="page-description">Approve, reject, and revoke workspace access from one place.</p>
      <span className="owner-badge">Owner only</span>
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="access-section"><h2>Pending requests</h2>{pending.length === 0 ? <div className="empty-list">No pending requests.</div> : pending.map((profile) => <AccessRow key={profile.id} profile={profile}><button className="primary-button" disabled={busyId === profile.id} onClick={() => setStatus(profile, "approved")}>Approve</button><button className="outline-button" disabled={busyId === profile.id} onClick={() => setStatus(profile, "rejected")}>Reject</button></AccessRow>)}</section>
      <section className="access-section"><h2>Approved users</h2>{approved.length === 0 ? <div className="empty-list">No approved users yet.</div> : approved.map((profile) => <AccessRow key={profile.id} profile={profile}><span className="access-status">Approved</span><button className="danger-button" disabled={busyId === profile.id} onClick={() => setStatus(profile, "revoked")}>Revoke</button></AccessRow>)}</section>
    </>
  );
}

function AccessRow({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const initial = (profile.display_name || profile.email).charAt(0).toUpperCase();
  return <div className="access-row"><span className="avatar">{initial}</span><div className="access-identity"><strong>{profile.display_name || profile.email.split("@")[0]}</strong><span>{profile.email}</span>{profile.access_status === "pending" && <span>Requested access</span>}</div><div className="access-actions">{children}</div></div>;
}
