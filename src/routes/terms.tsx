import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    ...meta(
      "Terms & Conditions · Avrasya Properties",
      "Draft Terms & Conditions for Avrasya Properties — approved text pending legal review.",
      "/terms"
    ),
  }),
  component: () => (
    <LegalDraft
      title="Terms & Conditions"
      topics={[
        "Use of this website",
        "Nature of the information provided",
        "Limitation of liability",
      ]}
    />
  ),
});
