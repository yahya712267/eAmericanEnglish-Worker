"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Workspace } from "@/lib/types";
import { productEntries } from "@/lib/types";

export function WorkspaceSidebar({ current, workspaces, profile }: { current: Workspace; workspaces: Workspace[]; profile: Profile }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);
  const router = useRouter();

  return (
    <>
      <nav className="nav workspace-tree" aria-label="Workspace navigation">
        <button className="tree-toggle" onClick={() => setWorkspaceOpen((value) => !value)} aria-expanded={workspaceOpen}>
          <span className="nav-icon">▦</span>Workspaces<span className="tree-caret">⌄</span>
        </button>
        {workspaceOpen && (
          <div className="workspace-switcher">
            {workspaces.map((workspace) => (
              <button
                className={`workspace-option ${workspace.id === current.id ? "current" : ""}`}
                key={workspace.id}
                onClick={() => { setWorkspaceOpen(false); router.push(`/workspaces/${workspace.id}`); }}
              >
                <span className="current-dot" />{workspace.name}
              </button>
            ))}
            <button className="workspace-option" onClick={() => router.push("/workspaces")}>View all workspaces</button>
          </div>
        )}
        <div className="current-workspace"><span className="current-dot" />{current.name}</div>
        <button className="products-toggle" onClick={() => setProductsOpen((value) => !value)} aria-expanded={productsOpen}>
          <span>◫</span>Products<span className="tree-caret">⌄</span>
        </button>
        {productsOpen && (
          <div className="product-list">
            {productEntries.map((product) => (
              <button
                className="product-entry"
                key={product}
                title={product === "Video Generator" ? "Open Video Generator" : "Coming in a future milestone"}
                onClick={() => { if (product === "Video Generator") router.push(`/workspaces/${current.id}/video-generator`); }}
              >
                <span className="product-dot" />{product}
              </button>
            ))}
          </div>
        )}
        <div className="workspace-nav-after">
          <span className="nav-item" aria-disabled="true"><span className="nav-icon">▣</span>Assets</span>
          {profile.access_status === "owner" && <button className="nav-item" onClick={() => router.push("/users")}><span className="nav-icon">◎</span>Users</button>}
          <span className="nav-item" aria-disabled="true"><span className="nav-icon">⚙</span>Settings</span>
        </div>
      </nav>
    </>
  );
}
