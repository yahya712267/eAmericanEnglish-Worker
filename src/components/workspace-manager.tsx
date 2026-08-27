"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/types";

type Modal = { type: "create" } | { type: "rename" | "delete"; workspace: Workspace } | null;

export function WorkspaceManager({ initialWorkspaces }: { initialWorkspaces: Workspace[] }) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function createWorkspace(formData: FormData) {
    setBusy(true); setError(null);
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim() || null;
    const { data, error: requestError } = await supabase.from("workspaces").insert({ name, description }).select().single();
    if (requestError) { setError(requestError.message); setBusy(false); return; }
    setWorkspaces((items) => [...items, data as Workspace]); setModal(null); setBusy(false);
  }

  async function renameWorkspace(formData: FormData) {
    if (!modal || modal.type !== "rename") return;
    setBusy(true); setError(null);
    const name = String(formData.get("name") || "").trim();
    const { data, error: requestError } = await supabase.from("workspaces").update({ name }).eq("id", modal.workspace.id).select().single();
    if (requestError) { setError(requestError.message); setBusy(false); return; }
    setWorkspaces((items) => items.map((item) => item.id === data.id ? data as Workspace : item)); setModal(null); setBusy(false);
  }

  async function deleteWorkspace() {
    if (!modal || modal.type !== "delete") return;
    setBusy(true); setError(null);
    const { error: requestError } = await supabase.from("workspaces").delete().eq("id", modal.workspace.id);
    if (requestError) { setError(requestError.message); setBusy(false); return; }
    setWorkspaces((items) => items.filter((item) => item.id !== modal.workspace.id)); setModal(null); setBusy(false);
  }

  return (
    <>
      <div className="page-heading-row">
        <div><h1 className="page-heading">Workspaces</h1><p className="page-description">Every approved Worker user can see and work in the same shared company workspaces.</p></div>
        <button className="primary-button" onClick={() => { setError(null); setModal({ type: "create" }); }}>+ New Workspace</button>
      </div>
      <h2 className="section-title">All workspaces</h2>
      <p className="section-description">Open a workspace to access its products and projects.</p>
      {workspaces.length === 0 ? <div className="empty-list">No workspaces yet.</div> : (
        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div className="workspace-card" key={workspace.id} role="link" tabIndex={0} onClick={() => router.push(`/workspaces/${workspace.id}`)} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/workspaces/${workspace.id}`); }}>
              <span className="workspace-icon">{workspace.name.charAt(0).toUpperCase()}</span>
              <span className="workspace-copy"><strong>{workspace.name}</strong><span>{workspace.description || "Shared company workspace"}</span></span>
              <button
                className={`more-button ${menuId === workspace.id ? "active" : ""}`}
                aria-label={`More actions for ${workspace.name}`}
                aria-expanded={menuId === workspace.id}
                onClick={(event) => { event.stopPropagation(); setMenuId((id) => id === workspace.id ? null : workspace.id); }}
              >•••</button>
              {menuId === workspace.id && (
                <div className="workspace-menu" onClick={(event) => event.stopPropagation()}>
                  <button className="menu-action" onClick={() => { setMenuId(null); setError(null); setModal({ type: "rename", workspace }); }}>Rename workspace</button>
                  <button className="menu-action danger" onClick={() => { setMenuId(null); setError(null); setModal({ type: "delete", workspace }); }}>Delete workspace</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal?.type === "create" && <ModalBackdrop onClose={() => setModal(null)}><form className="modal" action={createWorkspace}><h2>Create workspace</h2><p className="modal-copy">Create a new shared workspace for your team.</p><label className="field">Workspace name<input name="name" placeholder="Enter workspace name" required maxLength={120} autoFocus /></label><label className="field">Description (optional)<input name="description" placeholder="Add a short description" maxLength={240} /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="outline-button" type="button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? "Creating..." : "Create workspace"}</button></div></form></ModalBackdrop>}

      {modal?.type === "rename" && <ModalBackdrop onClose={() => setModal(null)}><form className="modal" action={renameWorkspace}><h2>Rename workspace</h2><p className="modal-copy">Change the workspace name. Everyone with access will see the new name.</p><label className="field">Workspace name<input name="name" defaultValue={modal.workspace.name} required maxLength={120} autoFocus /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="outline-button" type="button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button></div></form></ModalBackdrop>}

      {modal?.type === "delete" && <ModalBackdrop onClose={() => setModal(null)}><div className="modal delete"><div className="danger-icon">×</div><h2>Delete workspace?</h2><p className="modal-copy">This will permanently delete “{modal.workspace.name}” and its workspace data. This action cannot be undone.</p>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="outline-button" onClick={() => setModal(null)}>Cancel</button><button className="danger-button" disabled={busy} onClick={deleteWorkspace}>{busy ? "Deleting..." : "Delete"}</button></div></div></ModalBackdrop>}
    </>
  );
}

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>{children}</div>;
}
