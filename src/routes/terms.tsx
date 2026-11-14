import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

function TermsPage() {
  const { t } = useTranslation();
  return (
    <ManagedPage slug="terms">
      <LegalDraft title={t.legalDraftPages.termsTitle} topics={t.legalDraftPages.termsTopics} />
    </ManagedPage>
  );
}

export const Route = createFileRoute("/terms")({
  head: () => ({
    ...meta(
      "Terms & Conditions · Avrasya Properties",
      "Draft Terms & Conditions for Avrasya Properties — approved text pending legal review.",
      "/terms",
    ),
  }),
  component: TermsPage,
});
