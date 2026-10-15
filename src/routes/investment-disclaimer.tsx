import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/investment-disclaimer")({
  head: () => ({
    ...meta(
      "Investment Disclaimer · Avrasya Properties",
      "Draft Investment Disclaimer for Avrasya Properties — approved text pending legal review.",
      "/investment-disclaimer"
    ),
  }),
  component: () => (
    <ManagedPage slug="investment-disclaimer"><LegalDraft
      title="Investment Disclaimer"
      topics={[
        "Source-advertised prices and availability",
        "No legal financial or tax advice",
        "Citizenship and residence eligibility",
      ]}
    /></ManagedPage>
  ),
});

