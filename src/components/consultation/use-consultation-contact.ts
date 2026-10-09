import { useMemo, useSyncExternalStore } from "react";
import {
  parseStoredContact,
  readStoredContactRaw,
} from "@/lib/consultation/contact-handoff";
import type { ConsultationContact } from "@/lib/consultation/links";

// sessionStorage has no change events within the same tab, so there is
// nothing to subscribe to; the value is read once per render.
function subscribe(): () => void {
  return () => {};
}

/**
 * The name and email the visitor just sent, or null (on the server, on
 * first hydration, or when storage is unavailable or the hand-off is old).
 */
export function useConsultationContact(): ConsultationContact | null {
  const raw = useSyncExternalStore(subscribe, readStoredContactRaw, () => null);
  return useMemo(() => parseStoredContact(raw), [raw]);
}
