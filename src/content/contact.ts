import { trainer } from "./trainer";

/** A contact method rendered as a link (mailto:, tel:, or sms:). */
export interface ContactLink {
  readonly label: string;
  readonly href: string;
}

/** Converts a US display number like "(707) 861-0580" to "+17078610580". */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

const { email, phone } = trainer.contact;

/** Public contact email, or null until one is set in trainer.ts. */
export const contactEmail: ContactLink | null =
  email === null ? null : { label: email, href: `mailto:${email}` };

/** Phone number as a call link, or null until one is set in trainer.ts. */
export const contactPhone: ContactLink | null =
  phone === null ? null : { label: phone, href: `tel:${toE164(phone)}` };

/** Phone number as a text-message link, or null until one is set. */
export const contactSms: ContactLink | null =
  phone === null ? null : { label: phone, href: `sms:${toE164(phone)}` };
