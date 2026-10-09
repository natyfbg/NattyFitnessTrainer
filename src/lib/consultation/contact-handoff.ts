// Browser-only. Hands the visitor's name and email from the consultation
// form to the thank-you page so the booking calendar and questionnaire
// link can be pre-filled. Kept in sessionStorage (this tab only, cleared
// when it closes) and never put in a URL on this site. Every access is
// wrapped in try/catch because storage can be unavailable (private
// browsing, blocked site data); the page then simply isn't pre-filled.
import type { ConsultationContact } from "./links";

const STORAGE_KEY = "nft.consultation.contact";
/** Older hand-offs are ignored, so a long-lived tab doesn't reuse stale details. */
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

interface StoredContact extends ConsultationContact {
  readonly savedAt: number;
}

export function saveConsultationContact(contact: ConsultationContact): void {
  try {
    const value: StoredContact = { ...contact, savedAt: Date.now() };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable: the thank-you page just won't be pre-filled.
  }
}

/** The raw stored string, or null. Stable between calls, as useSyncExternalStore requires. */
export function readStoredContactRaw(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseStoredContact(
  raw: string | null,
): ConsultationContact | null {
  if (!raw) {
    return null;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) {
      return null;
    }
    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.fullName !== "string" ||
      typeof candidate.email !== "string" ||
      typeof candidate.savedAt !== "number" ||
      Date.now() - candidate.savedAt > MAX_AGE_MS
    ) {
      return null;
    }
    return { fullName: candidate.fullName, email: candidate.email };
  } catch {
    return null;
  }
}

export function readConsultationContact(): ConsultationContact | null {
  return parseStoredContact(readStoredContactRaw());
}
