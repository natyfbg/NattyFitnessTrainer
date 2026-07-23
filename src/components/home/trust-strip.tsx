import { Container } from "@/components/container";
import { TrustItem } from "@/components/trust-item";
import { trainer } from "@/content/trainer";
import { trainingStyles, coachingBenefits } from "@/content/coaching";

export function TrustStrip() {
  return (
    <div className="border-b border-border bg-background-elevated py-8">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:justify-between">
          <TrustItem>{trainer.credentials.join(", ")}</TrustItem>
          <TrustItem>{trainer.yearsOfExperience} Years of Experience</TrustItem>
          <TrustItem>
            {trainingStyles.map((style) => style.label).join(" · ")}
          </TrustItem>
          {coachingBenefits.map((benefit) => (
            <TrustItem key={benefit.title}>{benefit.title}</TrustItem>
          ))}
        </ul>
      </Container>
    </div>
  );
}
