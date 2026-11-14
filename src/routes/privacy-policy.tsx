import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

function PrivacyPolicyPage() {
  const { t } = useTranslation();
  return (
    <ManagedPage slug="privacy-policy">
      <LegalDraft title={t.legalDraftPages.privacyTitle} topics={t.legalDraftPages.privacyTopics} />
    </ManagedPage>
  );
}

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    ...meta(
      "Privacy Policy · Avrasya Properties",
      "Draft Privacy Policy for Avrasya Properties — approved text pending legal review.",
      "/privacy-policy",
    ),
  }),
  component: PrivacyPolicyPage,
});
