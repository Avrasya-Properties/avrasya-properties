import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    ...meta(
      "Privacy Policy (draft)",
      "Draft Privacy Policy for Avrasya Properties — approved text pending.",
    ),
  }),
  component: () => (
    <LegalDraft
      title="Privacy Policy"
      topics={[
        "What personal data is collected through enquiries",
        "How enquiry data is used and stored",
        "Your rights and how to contact us",
      ]}
    />
  ),
});
