import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    ...meta(
      "Terms & Conditions (draft)",
      "Draft Terms & Conditions for Avrasya Properties — approved text pending.",
    ),
  }),
  component: () => (
    <ManagedPage slug="terms"><LegalDraft
      title="Terms & Conditions"
      topics={[
        "Use of this website",
        "Nature of the information provided",
        "Limitation of liability",
      ]}
    /></ManagedPage>
  ),
});

