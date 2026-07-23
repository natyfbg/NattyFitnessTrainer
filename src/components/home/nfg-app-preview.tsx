import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { PhotoFrame } from "@/components/photo-frame";
import { nfgApp } from "@/content/nfg-app";
import { nfgAppSectionIntro } from "@/content/home";
import { homeMedia } from "@/content/media";

export function NfgAppPreview() {
  return (
    <Section id="nfg-app" tone="elevated" aria-labelledby="nfg-app-heading">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            id="nfg-app-heading"
            eyebrow={nfgAppSectionIntro.eyebrow}
            heading={nfgAppSectionIntro.heading}
            supportingStatement={nfgApp.tagline}
          />
          <ul className="mt-6 flex flex-col gap-2 text-sm text-foreground-muted">
            {nfgApp.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-gold"
                />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-gold">
            Not yet available for download
          </p>
        </div>

        {/*
          Conceptual device-frame preview. Populate homeMedia.nfgScreenshotPrimary
          (and optionally nfgScreenshotSecondary) in src/content/media.ts once
          real app screenshots exist — this structure does not need to change.
        */}
        <div className="mx-auto w-full max-w-[260px]">
          <div className="mb-4 flex justify-center">
            <span className="rounded-pill border border-border px-3 py-1 text-xs font-medium text-foreground-muted">
              Coming Soon
            </span>
          </div>
          <div className="relative lg:pr-8 lg:pb-8">
            <PhotoFrame
              image={homeMedia.nfgScreenshotPrimary}
              aspectClassName="aspect-9/16"
              fallbackVariant="device"
              sizes="260px"
              className="shadow-elevated"
            />
            <div className="absolute right-0 bottom-0 hidden w-2/5 lg:block">
              <PhotoFrame
                image={homeMedia.nfgScreenshotSecondary}
                aspectClassName="aspect-9/16"
                fallbackVariant="device"
                sizes="120px"
                className="shadow-elevated ring-4 ring-background-elevated"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
