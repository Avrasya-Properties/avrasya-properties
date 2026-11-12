import { useServices, useFaqs } from "@/data/live";
import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { CtaBand, PageIntro } from "@/components/site/Chrome";
import { BildoraServicesTimeline } from "@/components/site/BildoraServicesTimeline";
import { meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

export const Route = createFileRoute("/services")({
  head: () =>
    meta(
      "Property Advisory & Buying Services · Avrasya Properties",
      "Ten end-to-end property advisory services covering personalized search, Turkish citizenship, independent legal checks, interior setup, and ongoing management.",
      "/services",
    ),
  component: () => (
    <ManagedPage slug="services">
      <ServicesPage />
    </ManagedPage>
  ),
});

export function ServicesPage() {
  const { t } = useTranslation();
  const serviceQuery = useServices();
  const faqQuery = useFaqs();

  const stepText = (step: unknown): string =>
    typeof step === "string"
      ? step
      : typeof (step as { title?: unknown })?.title === "string"
        ? String((step as { title: string }).title)
        : "";

  const managedServices = (serviceQuery.data ?? []).filter((s) => s.title && s.description);
  const managedFaqs = (faqQuery.data ?? [])
    .filter((f) => f.question && f.answer)
    .map((f) => ({ q: f.question, a: f.answer }));
  const allFaqs = [...managedFaqs, ...t.services.faqs];

  return (
    <>
      <PageIntro
        eyebrow={t.services.eyebrow}
        title={
          <>
            {t.services.title} {t.services.titleEm && <em>{t.services.titleEm}</em>}
          </>
        }
      >
        <p className="text-base sm:text-lg font-medium leading-relaxed text-on-dark/95">
          {t.services.subtitle}
        </p>
        {t.services.description && (
          <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">
            {t.services.description}
          </p>
        )}
      </PageIntro>

      {/* Our Values / Services Vertical Alternating Scroll Timeline (Brought from Homepage) */}
      <BildoraServicesTimeline
        badgeText="Our Values"
        heading="Built on Values. Driven by Quality."
        subtitle="We combine honest communication, thoughtful planning, and dependable craftsmanship to deliver real estate projects that stand strong and create lasting value."
        showDeliverables={true}
        showCtaFooter={true}
        services={[]}
      />

      {/* Managed Services Section (Supplementary CMS listings from Supabase) */}
      {managedServices.length > 0 && (
        <section data-managed-services className="border-b bg-secondary/40 py-14">
          <div className="container-site">
            <p className="kicker text-brass-text">{t.services.eyebrow}</p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {managedServices.map((s) => (
                <li key={s.id} className="flex flex-col border border-border bg-card p-6">
                  {s.category && (
                    <span className="kicker !text-[0.62rem] text-muted-foreground">
                      {s.category}
                    </span>
                  )}
                  <h3 className="font-display mt-2 text-2xl leading-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                  {Array.isArray(s.process_steps) && s.process_steps.length > 0 && (
                    <ol className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-foreground">
                      {s.process_steps
                        .map(stepText)
                        .filter(Boolean)
                        .map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                            <span>{step}</span>
                          </li>
                        ))}
                    </ol>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      <section className="container-site py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow">{t.services.faqEyebrow}</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              {t.services.faqTitle}
            </h2>
          </div>
          <div className="space-y-4">
            {allFaqs.map((faq, i) => (
              <details
                key={i}
                className="card-elevate rounded-xs border border-border/80 bg-card p-4 transition-all"
              >
                <summary className="cursor-pointer font-display text-base font-semibold text-foreground flex items-center justify-between">
                  <span>{faq.q}</span>
                  <HelpCircle className="h-4 w-4 text-brass shrink-0 ml-2" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed pl-1">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Consultation Link */}
      <div className="container-site pb-12 flex justify-center">
        <Link to="/contact" className="btn btn-primary text-base px-8 py-3 shadow-md btn-shimmer">
          {t.cta.scheduleMeeting}
        </Link>
      </div>

      <CtaBand />
    </>
  );
}
