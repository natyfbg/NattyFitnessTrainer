export interface NfgAppInfo {
  readonly name: string;
  readonly status: "coming-soon";
  readonly tagline: string;
  readonly features: readonly string[];
}

/** Upcoming companion fitness app. No release date or store link exists yet. */
export const nfgApp: NfgAppInfo = {
  name: "NFG App",
  status: "coming-soon",
  tagline: "A companion fitness app is in development.",
  features: [
    "Workout access on the go",
    "Progress tracking",
    "Direct coaching support",
  ],
};
