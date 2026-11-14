import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

function InvestmentDisclaimerPage() {
  const { t } = useTranslation();
  return (
    <ManagedPage slug="investment-disclaimer">
      <LegalDraft
        title={t.legalDraftPages.disclaimerTitle}
        topics={t.legalDraftPages.disclaimerTopics}
      />
    </ManagedPage>
  );
}

export const Route = createFileRoute("/investment-disclaimer")({
  head: () => ({
    ...meta(
      "Investment Disclaimer · Avrasya Properties",
      "Draft Investment Disclaimer for Avrasya Properties — approved text pending legal review.",
      "/investment-disclaimer",
    ),
  }),
  component: InvestmentDisclaimerPage,
});
