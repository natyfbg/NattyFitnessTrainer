import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import {
  programmingConsiderationsIntro,
  programmingConsiderations,
} from "@/content/coaching-page";

export function ProgrammingConsiderations() {
  return (
    <Section id="programming" aria-labelledby="programming-heading" narrow>
      <SectionHeading
        id="programming-heading"
        eyebrow={programmingConsiderationsIntro.eyebrow}
        heading={programmingConsiderationsIntro.heading}
      />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {programmingConsiderations.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-foreground-muted"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
