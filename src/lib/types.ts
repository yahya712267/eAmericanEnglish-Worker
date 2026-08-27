export type AccessStatus = "owner" | "pending" | "approved" | "rejected" | "revoked";

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  access_status: AccessStatus;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const productEntries = [
  "Video Generator",
  "Thumbnail Generator",
  "Image Generator",
  "Audio Tools",
] as const;
