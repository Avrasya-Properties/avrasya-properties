import { useEffect, useId, useRef, useState } from "react";
import { DEMO_MODE } from "@/lib/supabase";
import { useServices, useCatalogue } from "@/data/live";
import { useLiveContact } from "@/hooks/useLiveContact";
import { recordPublicEnquiry } from "@/admin/store";
import { useLanguage } from "@/hooks/useLanguage";

const SERVICES = [
  "General consultation",
  "Investment Advisory",
  "Property Selection",
  "Citizenship Consultancy",
  "Legal & Administrative Coordination",
  "Property Acquisition",
  "Residence Permit Support",
  "Property Management",
  "Rental Strategy",
  "Resale Strategy",
  "International Investor Support",
  "Investment catalog request",
];

export function buildMessage(v: {
  name: string;
  topic: string;
  budget: string;
  message: string;
}) {
  return [
    `Hello Avrasya Properties, my name is ${v.name.trim()}.`,
    `Enquiry: ${v.topic}`,
    v.budget.trim() && `Budget: ${v.budget.trim()}`,
    "",
    v.message.trim(),
  ]
    .filter((x): x is string => typeof x === "string" && x !== "")
    .join("\n");
}

export function Enquiry({
  defaultTopic,
  compact,
  propertySlug,
  preview = false,
}: {
  defaultTopic?: string;
  compact?: boolean;
  propertySlug?: string;
  preview?: boolean;
}) {
  const { t, isRtl } = useLanguage();
  const servicesQuery = useServices();
  const services = DEMO_MODE
    ? SERVICES
    : ["General consultation", ...(servicesQuery.data || []).map((s: { title: string }) => s.title)];
  const previousTopic = useRef(defaultTopic);
  const contact = useLiveContact();
  const catalogue = useCatalogue();
  const id = useId();
  const submission = useRef<string | null>(null);
  const [v, setV] = useState({
    name: "",
    email: "",
    phone: "",
    topic: defaultTopic || "General consultation",
    budget: "",
    message: "",
    website: "",
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [receipt, setReceipt] = useState("");

  const set =
    (key: keyof typeof v) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      setV({ ...v, [key]: e.target.value });
      submission.current = null;
      setReceipt("");
    };

  useEffect(() => {
    const old = previousTopic.current;
    setV((curr) =>
      curr.topic === old ? { ...curr, topic: defaultTopic || "General consultation" } : curr,
    );
    previousTopic.current = defaultTopic;
  }, [defaultTopic]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;
    setErr(null);
    if (v.name.trim().length < 2) return setErr(t.enquiry.fullName + " *");
    if (v.message.trim().length < 5) return setErr(t.enquiry.message + " *");
    if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
      return setErr(t.enquiry.email + " *");
    if (!v.email.trim() && v.phone.replace(/\D/g, "").length < 7)
      return setErr(t.enquiry.phone + " *");
    if (!DEMO_MODE && !consent) return setErr(t.enquiry.termsConsent || "Please consent to being contacted.");

    setBusy(true);
    try {
      submission.current ??= crypto.randomUUID();
      const property = catalogue.properties.find((r) => r.marketing_title === v.topic);
      const resolvedSlug = propertySlug || property?.slug;
      const res = await recordPublicEnquiry({
        name: v.name,
        email: v.email,
        phone: v.phone,
        topic: v.topic,
        budget: v.budget,
        message: v.message,
        consent,
        idempotencyKey: submission.current,
        website: v.website,
        source: (propertySlug || property) ? "Property Modal" : "Website Consultation",
        ...(resolvedSlug ? { propertySlug: resolvedSlug } : {}),
      });

      setReceipt(res.receipt);
    } catch (error) {
      setErr((error as Error).message || t.enquiry.errorDesc);
    } finally {
      setBusy(false);
    }
  }

  const label = "eyebrow !text-muted-foreground !text-[0.65rem] block mb-1.5";
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <fieldset disabled={busy || preview} className="space-y-4">
        <div>
          <label htmlFor={id + "-name"} className={label}>
            {t.enquiry.fullName} *
          </label>
          <input
            id={id + "-name"}
            className="field"
            value={v.name}
            onChange={set("name")}
            autoComplete="name"
            maxLength={200}
            placeholder={t.enquiry.fullNamePlaceholder}
          />
        </div>
        {!DEMO_MODE && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={id + "-email"} className={label}>
                {t.enquiry.email} *
              </label>
              <input
                id={id + "-email"}
                className="field"
                type="email"
                autoComplete="email"
                value={v.email}
                onChange={set("email")}
                maxLength={254}
                placeholder={t.enquiry.emailPlaceholder}
              />
            </div>
            <div>
              <label htmlFor={id + "-phone"} className={label}>
                {t.enquiry.phone} *
              </label>
              <input
                id={id + "-phone"}
                className="field"
                type="tel"
                autoComplete="tel"
                value={v.phone}
                onChange={set("phone")}
                maxLength={40}
                placeholder={t.enquiry.phonePlaceholder}
              />
            </div>
          </div>
        )}
        <div>
          <label htmlFor={id + "-topic"} className={label}>
            {t.enquiry.topic}
          </label>
          <select
            id={id + "-topic"}
            className="field"
            value={v.topic}
            onChange={set("topic")}
          >
            {defaultTopic && !services.includes(defaultTopic) && (
              <option>{defaultTopic}</option>
            )}
            <optgroup label={t.nav.services}>
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </optgroup>
            {!compact && (
              <optgroup label={t.footer.explorePortfolio}>
                {catalogue.properties.map((p) => (
                  <option key={p.slug}>{p.marketing_title}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <div>
          <label htmlFor={id + "-budget"} className={label}>
            {t.enquiry.budget}
          </label>
          <input
            id={id + "-budget"}
            className="field"
            value={v.budget}
            onChange={set("budget")}
            placeholder={t.enquiry.budgetPlaceholder}
            maxLength={200}
          />
        </div>
        <div>
          <label htmlFor={id + "-message"} className={label}>
            {t.enquiry.message} *
          </label>
          <textarea
            id={id + "-message"}
            className="field min-h-28"
            value={v.message}
            onChange={set("message")}
            maxLength={4000}
            placeholder={t.enquiry.messagePlaceholder}
          />
        </div>
        {!DEMO_MODE && (
          <>
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={v.website}
                  onChange={set("website")}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{t.enquiry.termsConsent}</span>
            </label>
          </>
        )}
        {err && (
          <p role="alert" className="text-sm text-destructive">
            {err}
          </p>
        )}
        {receipt ? (
          <div role="status" className="rounded-xs border border-brass/50 bg-[#07191e] p-4 text-sm text-foreground space-y-2.5">
            <div className="flex items-center gap-2 text-brass font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.enquiry.successTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.enquiry.propertyReference} <strong className="text-brass font-mono">{receipt}</strong>. {t.enquiry.successDesc}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={contact.whatsapp + "?text=" + encodeURIComponent(`Hello Avrasya Advisory, my inquiry reference is ${receipt}: ${v.message}`)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary text-xs !py-1.5"
              >
                {t.enquiry.directWhatsappBtn} →
              </a>
              <button
                type="button"
                onClick={() => {
                  setReceipt("");
                  setV({ name: "", email: "", phone: "", topic: defaultTopic || "General consultation", budget: "", message: "", website: "" });
                }}
                className="btn btn-outline text-xs !py-1.5"
              >
                {t.common.retry}
              </button>
            </div>
          </div>
        ) : (
          <button type="submit" className="btn btn-primary w-full shadow-sm btn-shimmer">
            {busy ? t.enquiry.submitting : t.enquiry.submitBtn}
          </button>
        )}
        <p className="text-xs text-muted-foreground">
          {t.enquiry.whatsappAlternative}{" "}
          <a
            className="underline"
            href={contact.whatsapp + "?text=" + encodeURIComponent(buildMessage(v))}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          ,{" "}
          <a className="underline" href={"mailto:" + contact.email}>
            {contact.email}
          </a>{" "}
          or{" "}
          <a className="underline" href={contact.phoneHref}>
            {contact.phone}
          </a>
          .
        </p>
      </fieldset>
    </form>
  );
}

