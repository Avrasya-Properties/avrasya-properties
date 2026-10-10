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
  Sparkles 
} from "lucide-react";
import { PageIntro } from "@/components/site/Chrome";
import { Enquiry } from "@/components/site/Enquiry";
import { meta } from "@/components/site/TextPage";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/contact")({
  head: () =>
    meta(
      "Contact & Private Consultation · Avrasya Properties",
      "Schedule a private property consultation in Istanbul or via encrypted video conference. WhatsApp, phone, and office visiting directions."
    ),
  component: ContactPage,
});

export function ContactPage() {
  const [selectedTopic, setSelectedTopic] = useState("citizenship");

  const topics = [
    { id: "citizenship", label: "Citizenship by Investment ($400k+)" },
    { id: "residential", label: "Residential Acquisition / Lifestyle" },
    { id: "commercial", label: "Commercial / High-Yield Portfolio" },
    { id: "management", label: "Property Management & Resale" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Istanbul Office · International Advisory Desk"
        title={
          <>
            Start your Istanbul property <em>consultation.</em>
          </>
        }
      >
        <p>
          Connect directly with our senior client directors by WhatsApp, telephone, or scheduled video conference. We provide objective, unhurried guidance tailored to your family's objectives.
        </p>
      </PageIntro>

      <section className="container-site py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main Enquiry Form */}
          <div className="rounded-2xl border bg-card p-6 lg:col-span-7 md:p-8">
            <div className="mb-6">
              <span className="eyebrow">Private Brief</span>
              <h2 className="font-display text-2xl font-bold text-foreground">Submit Your Property Brief</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your brief is handled with strict confidentiality. Draft an inquiry below to receive an instant WhatsApp or email introduction.
              </p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Primary Inquiry Focus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopic(t.id)}
                    className={`rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                      selectedTopic === t.id
                        ? "border-brass bg-brass/10 text-brass ring-1 ring-brass"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Enquiry />
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
                  <h3 className="font-semibold text-foreground">Direct WhatsApp Desk</h3>
                  <p className="text-xs text-muted-foreground">Average response time: &lt; 15 minutes</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Need urgent confirmation on a specific project price, layout availability, or CBI eligibility? Our advisors are available directly on WhatsApp.
              </p>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat on WhatsApp: {CONTACT.phone}</span>
              </a>
            </div>

            {/* Direct Coordinates */}
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">Office Coordinates</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-brass shrink-0 mt-1" />
                  <div>
                    <span className="font-medium text-foreground block">Headquarters:</span>
                    <span className="text-muted-foreground">{CONTACT.address}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">Overlooking the Bosphorus · Walking distance to Marmaray</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brass shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">Telephone:</span>
                    <a href={CONTACT.phoneHref} className="text-muted-foreground hover:text-foreground">
                      {CONTACT.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brass shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">Official Inquiries:</span>
                    <a href={`mailto:${CONTACT.email}`} className="text-muted-foreground hover:text-foreground break-all">
                      {CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-brass shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">Desk Hours:</span>
                    <span className="text-muted-foreground">Monday – Saturday: 09:00 – 19:00 TRT (UTC+3)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust and Representation */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-2 text-brass font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Licensed Operating Entity</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Operating entity: <b>{CONTACT.company}</b>. All transactional agreements are notarized under Turkish commercial law. Client funds are never deposited to unregulated personal accounts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
