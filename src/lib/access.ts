import type { AccessStatus } from "@/lib/types";

export const OWNER_EMAIL = "yahya@eamericanenglish.com";

export function canEnterWorker(status: AccessStatus | null | undefined) {
  return status === "owner" || status === "approved";
}

export function initialAccessStatus(email: string): AccessStatus {
  return email.trim().toLowerCase() === OWNER_EMAIL ? "owner" : "pending";
}
