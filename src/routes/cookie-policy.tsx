import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    ...meta(
      "Cookie Policy (draft)",
      "Draft Cookie Policy for Avrasya Properties — approved text pending.",
    ),
  }),
  component: () => (
    <LegalDraft
      title="Cookie Policy"
      topics={[
        "Cookies and similar technologies used",
        "Analytics and preferences",
        "How to manage cookies",
      ]}
    />
  ),
});
