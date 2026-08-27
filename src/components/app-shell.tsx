import Link from "next/link";
import type { Profile } from "@/lib/types";

type AppShellProps = {
  profile: Profile;
  active: "workspaces" | "users" | "workspace";
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
};

export function AppShell({ profile, active, children, sidebarContent }: AppShellProps) {
  const initial = (profile.display_name || profile.email || "Y").charAt(0).toUpperCase();
  const name = profile.display_name?.split(" ")[0] || profile.email.split("@")[0];

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="wordmark"><strong>eAmericanEnglish</strong><span>Worker</span></div>
        {sidebarContent ?? (
          <nav className="nav" aria-label="Main navigation">
            <Link className={`nav-item ${active === "workspaces" ? "active" : ""}`} href="/workspaces"><span className="nav-icon">▦</span>Workspaces</Link>
            <span className="nav-item" aria-disabled="true"><span className="nav-icon">▣</span>Assets</span>
            {profile.access_status === "owner" && <Link className={`nav-item ${active === "users" ? "active" : ""}`} href="/users"><span className="nav-icon">◎</span>Users</Link>}
            <span className="nav-item" aria-disabled="true"><span className="nav-icon">⚙</span>Settings</span>
          </nav>
        )}
        <div className="profile-card">
          <span className="avatar">{initial}</span>
          <div><strong>{name}</strong><span>{profile.access_status === "owner" ? "Owner" : "Approved user"}</span></div>
        </div>
      </aside>
      <header className="topbar"><div className="search-visual"><span>⌕</span><span>Search...</span></div></header>
      {children}
    </div>
  );
}
