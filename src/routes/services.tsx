import { useServices, useFaqs } from "@/data/live";
import { DEMO_MODE } from "@/lib/supabase";
import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  Compass, 
  FileCheck, 
  HelpCircle, 
  Key, 
  Landmark, 
  Layers, 
  LineChart, 
  PhoneCall, 
  Scale, 
  ShieldCheck, 
  Users 
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

export const Route = createFileRoute("/services")({
  head: () =>
    meta(
      "Property Advisory & Buying Services · Avrasya Properties",
      "Ten end-to-end property advisory services covering personalized search, Turkish citizenship, independent legal checks, interior setup, and ongoing management.",
      "/services"
    ),
  component: () => <ManagedPage slug="services"><ServicesPage /></ManagedPage>,
});

const SERVICE_ICONS = [
  LineChart,
  Compass,
  Scale,
  Landmark,
  FileCheck,
  Users,
  Key,
  Building2,
  Layers,
  ShieldCheck,
];

export function ServicesPage() {
  const { t } = useTranslation();
  const serviceQuery = useServices();
  const faqQuery = useFaqs();

  const services = t.services.services.map((s, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: s.title,
    category: s.category,
    desc: s.desc,
    deliverables: s.deliverables,
    icon: SERVICE_ICONS[i % SERVICE_ICONS.length] || Building2,
  }));

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...new Set(services.map((s) => s.category))];

  const filtered = activeCategory === "All" ? services : services.filter((s) => s.category === activeCategory);

  return (
    <>
      <PageIntro
        eyebrow={t.services.eyebrow}
        title={
          <>
            {t.services.title} <em>{t.services.titleEm}</em>
          </>
        }
      >
        <p>{t.services.description}</p>
      </PageIntro>

      {/* Ten Services Section */}
      <section className="container-site py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow">{t.services.coreServicesEyebrow}</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{t.services.coreServicesTitle}</h2>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-xs border border-border/80 bg-card p-1 text-xs shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xs px-3 py-1.5 font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-on-dark shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? t.common.viewAll : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.num} className="card-elevate group rounded-xs border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-brass/70 hover:shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-brass">{s.num}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {s.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-brass/10 text-brass">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>

              <div className="mt-6 border-t pt-4 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.services.deliverablesLabel}</p>
                {s.deliverables.map((del, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brass shrink-0" />
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Six Phase Journey */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-brass">{t.catalog.phasesEyebrow}</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              {t.catalog.phasesTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.catalog.phases.map((p) => (
              <div key={p.phase} className="card-elevate rounded-xs border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brass/50 hover:bg-white/8">
                <span className="font-mono text-xs font-bold text-brass uppercase tracking-widest">{p.phase}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-on-dark">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="container-site py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow">{t.services.faqEyebrow}</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{t.services.faqTitle}</h2>
          </div>
          <div className="space-y-4">
            {t.services.faqs.map((faq, i) => (
              <details key={i} className="card-elevate rounded-xs border border-border/80 bg-card p-4 transition-all">
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

      <div className="container-site pb-12 flex justify-center">
        <Link to="/contact" className="btn btn-primary text-base px-8 py-3 shadow-md btn-shimmer">
          {t.cta.scheduleMeeting}
        </Link>
      </div>

      <CtaBand />
    </>
  );
}
