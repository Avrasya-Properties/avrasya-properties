import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    ...meta(
      "Privacy Policy · Avrasya Properties",
      "Draft Privacy Policy for Avrasya Properties — approved text pending legal review.",
      "/privacy-policy"
    ),
  }),
  component: () => (
    <ManagedPage slug="privacy-policy"><LegalDraft
      title="Privacy Policy"
      topics={[
        "What personal data is collected through enquiries",
        "How enquiry data is used and stored",
        "Your rights and how to contact us",
      ]}
    /></ManagedPage>
  ),
});

