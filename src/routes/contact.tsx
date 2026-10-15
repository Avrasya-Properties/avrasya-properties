import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Calendar,
  Clock,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { PageIntro } from "@/components/site/Chrome";
import { Enquiry } from "@/components/site/Enquiry";
import { meta } from "@/components/site/TextPage";
import { useLiveContact } from "@/hooks/useLiveContact";
import { useTranslation } from "@/hooks/useLanguage";

export const Route = createFileRoute("/contact")({
  head: () =>
    meta(
      "Contact & Private Consultation · Avrasya Properties",
      "Schedule a private property consultation in Istanbul or via encrypted video conference. WhatsApp, phone, and office visiting directions.",
      "/contact"
    ),
  component: ContactPage,
});

export function ContactPage() {
  const { t } = useTranslation();
  const contact = useLiveContact();
  const [selectedTopic, setSelectedTopic] = useState("citizenship");

  const topics = [
    { id: "citizenship", label: t.contact.topicCitizenship },
    { id: "residential", label: t.contact.topicResidential },
    { id: "commercial", label: t.contact.topicCommercial },
    { id: "management", label: t.contact.topicManagement },
  ];

  return (
    <>
      <PageIntro
        eyebrow={t.contact.eyebrow}
        title={
          <>
            {t.contact.title} <em>{t.contact.titleEm}</em>
          </>
        }
      >
        <p>{t.contact.description}</p>
      </PageIntro>

      <section className="container-site py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main Enquiry Form */}
          <div className="rounded-2xl border bg-card p-6 lg:col-span-7 md:p-8">
            <div className="mb-6">
              <span className="eyebrow">{t.enquiry.title}</span>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {t.contact.scheduleMeeting}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.enquiry.subtitle}
              </p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                {t.contact.topicTitle}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topics.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTopic(item.id)}
                    className={`rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                      selectedTopic === item.id
                        ? "border-brass bg-brass/10 text-brass ring-1 ring-brass"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Enquiry key={selectedTopic} defaultTopic={topics.find((item) => item.id === selectedTopic)?.label || "General consultation"} />
          </div>

          {/* Direct Office & Desk Info */}
          <div className="space-y-6 lg:col-span-5">
            {/* Quick WhatsApp Action Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.contact.whatsappLabel}</h3>
                  <p className="text-xs text-muted-foreground">
                    &lt; 15 mins
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t.cta.whatsappDirect}
              </p>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{contact.phone}</span>
              </a>
            </div>

            {/* Direct Coordinates */}
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">{t.contact.officeVisiting}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-brass shrink-0 mt-1" />
                  <div>
                    <span className="font-medium text-foreground block">{t.contact.addressLabel}:</span>
                    <span className="text-muted-foreground">{contact.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brass shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">{t.contact.phoneLabel}:</span>
                    <a
                      href={contact.phoneHref}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brass shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">{t.contact.emailLabel}:</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-muted-foreground hover:text-foreground break-all"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-brass shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">{t.contact.hoursLabel}:</span>
                    <span className="text-muted-foreground">{t.contact.hoursValue || contact.advisoryHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust and Representation */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-2 text-brass font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>{contact.company}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {t.about.officeDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
