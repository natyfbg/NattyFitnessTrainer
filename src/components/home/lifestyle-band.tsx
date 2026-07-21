import { PhotoFrame } from "@/components/photo-frame";
import { homeMedia } from "@/content/media";

/**
 * Full-bleed visual pacing break between sections. Purely a visual moment —
 * no heading, so it isn't a labeled landmark section.
 */
export function LifestyleBand() {
  return (
    <div className="border-b border-border">
      <PhotoFrame
        image={homeMedia.lifestyleBand}
        aspectClassName="aspect-2/1 sm:aspect-21/9"
        fallbackVariant="texture"
        rounded={false}
        bordered={false}
        sizes="100vw"
      />
    </div>
  );
}
