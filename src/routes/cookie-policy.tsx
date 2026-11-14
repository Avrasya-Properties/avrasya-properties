import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { LegalDraft, meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

function CookiePolicyPage() {
  const { t } = useTranslation();
  return (
    <ManagedPage slug="cookie-policy">
      <LegalDraft title={t.legalDraftPages.cookieTitle} topics={t.legalDraftPages.cookieTopics} />
    </ManagedPage>
  );
}

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    ...meta(
      "Cookie Policy · Avrasya Properties",
      "Draft Cookie Policy for Avrasya Properties — approved text pending legal review.",
      "/cookie-policy",
    ),
  }),
  component: CookiePolicyPage,
});
