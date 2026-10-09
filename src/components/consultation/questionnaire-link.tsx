"use client";

import { getCtaClassName } from "@/components/cta-link";
import type { ConsultationQuestionnaireLink } from "@/content/consultation";
import { buildQuestionnaireLink } from "@/lib/consultation/links";
import { useConsultationContact } from "./use-consultation-contact";

interface QuestionnaireLinkProps {
  readonly questionnaire: ConsultationQuestionnaireLink;
  readonly label: string;
}

/** Opens the Google Form in a new tab, with the visitor's email pre-filled when known. */
export function QuestionnaireLink({
  questionnaire,
  label,
}: QuestionnaireLinkProps) {
  const contact = useConsultationContact();
  const href = buildQuestionnaireLink(questionnaire, contact?.email ?? null);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={getCtaClassName("primary")}
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
