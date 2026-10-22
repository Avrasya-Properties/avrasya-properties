import { useEffect, useId, useRef, useState } from "react";
import { DEMO_MODE } from "@/lib/supabase";
import { useServices, useCatalogue } from "@/data/live";
import { useLiveContact } from "@/hooks/useLiveContact";
import { recordPublicEnquiry } from "@/admin/store";
import { useLanguage } from "@/hooks/useLanguage";
import { EnquiryError } from "@/lib/public-enquiry";

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

type FieldKey = "name" | "email" | "phone" | "message" | "consent";

/** Mirrors the server rules in private.accept_enquiry so a form that passes here is accepted there. */
export function validateEnquiry(
  v: { name: string; email: string; phone: string; message: string },
  consent: boolean,
  demo: boolean,
): FieldKey[] {
  const bad: FieldKey[] = [];
  const name = v.name.trim();
  if (name.length < 2 || name.length > 200) bad.push("name");
  if (!demo) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()) || v.email.trim().length > 254) bad.push("email");
    const digits = v.phone.replace(/\D/g, "").length;
    if (digits < 7 || digits > 18) bad.push("phone");
  }
  const message = v.message.trim();
  if (message.length < 5 || message.length > 4000) bad.push("message");
  if (!demo && !consent) bad.push("consent");
  return bad;
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
  const { t } = useLanguage();
  const servicesQuery = useServices();
  const services = DEMO_MODE
    ? SERVICES
    : ["General consultation", ...(servicesQuery.data || []).map((s: { title: string }) => s.title)];
  const previousTopic = useRef(defaultTopic);
  const contact = useLiveContact();
  const catalogue = useCatalogue();
  const id = useId();
  const submission = useRef<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
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
  const [invalid, setInvalid] = useState<FieldKey[]>([]);
  const [receipt, setReceipt] = useState("");

  const fieldMessage: Record<FieldKey, string> = {
    name: t.enquiry.errName,
    email: t.enquiry.errEmail,
    phone: t.enquiry.errPhone,
    message: t.enquiry.errMessage,
    consent: t.enquiry.errConsent,
  };

  const set =
    (key: keyof typeof v) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setV({ ...v, [key]: e.target.value });
      // Any edit is a new submission; an unchanged retry keeps the same key so it cannot duplicate.
      submission.current = null;
      setReceipt("");
      if (invalid.includes(key as FieldKey)) setInvalid(invalid.filter((k) => k !== key));
    };

  useEffect(() => {
    const old = previousTopic.current;
    setV((curr) => (curr.topic === old ? { ...curr, topic: defaultTopic || "General consultation" } : curr));
    previousTopic.current = defaultTopic;
  }, [defaultTopic]);

  useEffect(() => {
    if (receipt) successRef.current?.focus();
  }, [receipt]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (preview || busy) return;
    setErr(null);
    const bad = validateEnquiry(v, consent, DEMO_MODE);
    setInvalid(bad);
    if (bad.length) {
      setErr(t.enquiry.errFix);
      document.getElementById(`${id}-${bad[0]}`)?.focus();
      return;
    }

    setBusy(true);
    try {
      submission.current ??= crypto.randomUUID();
      const property = catalogue.properties.find((r) => r.marketing_title === v.topic);
      const resolvedSlug = propertySlug || property?.slug;
      const res = await recordPublicEnquiry({
        name: v.name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        topic: v.topic,
        budget: v.budget,
        message: v.message.trim(),
        consent,
        idempotencyKey: submission.current,
        website: v.website,
        source: propertySlug || property ? "Property Modal" : "Website Consultation",
        ...(resolvedSlug ? { propertySlug: resolvedSlug } : {}),
      });
      setReceipt(res.receipt);
    } catch (error) {
      const kind = error instanceof EnquiryError ? error.kind : undefined;
      setErr(kind === "timeout" ? t.enquiry.errTimeout : kind === "network" ? t.enquiry.errNetwork : (error as Error).message || t.enquiry.errorDesc);
    } finally {
      setBusy(false);
    }
  }

  const label = "kicker !text-[0.62rem] text-muted-foreground block mb-1.5";
  const errorId = (key: FieldKey) => `${id}-${key}-error`;
  const fieldProps = (key: FieldKey) => ({
    id: `${id}-${key}`,
    "aria-invalid": invalid.includes(key) || undefined,
    "aria-describedby": invalid.includes(key) ? errorId(key) : undefined,
  });
  const fieldError = (key: FieldKey) =>
    invalid.includes(key) ? (
      <p id={errorId(key)} className="mt-1.5 text-xs text-destructive">
        {fieldMessage[key]}
      </p>
    ) : null;

  if (receipt) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border border-brass/60 bg-secondary/60 p-5 text-sm text-foreground outline-none">
        <p className="kicker text-brass-text">{t.enquiry.successTitle}</p>
        <p className="mt-3 leading-relaxed">
          {t.enquiry.propertyReference} <strong className="font-mono text-base tracking-wide">{receipt}</strong>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.enquiry.successNext}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <a
            href={contact.whatsapp + "?text=" + encodeURIComponent(`Hello Avrasya Advisory, my enquiry reference is ${receipt}.`)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary text-xs"
          >
            {t.enquiry.directWhatsappBtn}
          </a>
          <button
            type="button"
            onClick={() => {
              setReceipt("");
              submission.current = null;
              setConsent(false);
              setV({ name: "", email: "", phone: "", topic: defaultTopic || "General consultation", budget: "", message: "", website: "" });
            }}
            className="btn btn-outline text-xs"
          >
            {t.enquiry.newEnquiry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={busy}>
      <fieldset disabled={busy || preview} className="space-y-4">
        <div>
          <label htmlFor={`${id}-name`} className={label}>
            {t.enquiry.fullName} *
          </label>
          <input {...fieldProps("name")} className="field" value={v.name} onChange={set("name")} autoComplete="name" maxLength={200} placeholder={t.enquiry.fullNamePlaceholder} />
          {fieldError("name")}
        </div>
        {!DEMO_MODE && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-email`} className={label}>
                {t.enquiry.email} *
              </label>
              <input {...fieldProps("email")} className="field" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={set("email")} maxLength={254} placeholder={t.enquiry.emailPlaceholder} />
              {fieldError("email")}
            </div>
            <div>
              <label htmlFor={`${id}-phone`} className={label}>
                {t.enquiry.phone} *
              </label>
              <input {...fieldProps("phone")} className="field" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} maxLength={40} placeholder={t.enquiry.phonePlaceholder} />
              {fieldError("phone")}
            </div>
          </div>
        )}
        <div>
          <label htmlFor={`${id}-topic`} className={label}>
            {t.enquiry.topic}
          </label>
          <select id={`${id}-topic`} className="field" value={v.topic} onChange={set("topic")}>
            {defaultTopic && !services.includes(defaultTopic) && <option>{defaultTopic}</option>}
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
          <label htmlFor={`${id}-budget`} className={label}>
            {t.enquiry.budget}
          </label>
          <input id={`${id}-budget`} className="field" value={v.budget} onChange={set("budget")} placeholder={t.enquiry.budgetPlaceholder} maxLength={200} />
        </div>
        <div>
          <label htmlFor={`${id}-message`} className={label}>
            {t.enquiry.message} *
          </label>
          <textarea {...fieldProps("message")} className="field min-h-28" value={v.message} onChange={set("message")} maxLength={4000} placeholder={t.enquiry.messagePlaceholder} />
          {fieldError("message")}
        </div>
        {!DEMO_MODE && (
          <>
            {/* Honeypot: invisible to people, tempting to bots. The server rejects any value. */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
              </label>
            </div>
            <div>
              <label className="flex min-h-11 items-start gap-3 text-xs leading-relaxed">
                <input
                  {...fieldProps("consent")}
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brass)]"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (invalid.includes("consent")) setInvalid(invalid.filter((k) => k !== "consent"));
                  }}
                />
                <span>{t.enquiry.termsConsent}</span>
              </label>
              {fieldError("consent")}
            </div>
          </>
        )}
        {err && (
          <p role="alert" className="border-s-2 border-destructive ps-3 text-sm text-destructive">
            {err}
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full">
          {busy ? t.enquiry.submitting : t.enquiry.submitBtn}
        </button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t.enquiry.whatsappAlternative}{" "}
          <a className="underline underline-offset-2" href={contact.whatsapp + "?text=" + encodeURIComponent(buildMessage(v))} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          ,{" "}
          <a className="underline underline-offset-2" href={"mailto:" + contact.email}>
            {contact.email}
          </a>{" "}
          or{" "}
          <a className="underline underline-offset-2" href={contact.phoneHref}>
            {contact.phone}
          </a>
          .
        </p>
      </fieldset>
    </form>
  );
}