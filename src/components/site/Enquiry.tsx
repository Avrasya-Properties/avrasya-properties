import { useEffect, useId, useRef, useState } from "react";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { DEMO_MODE } from "@/lib/supabase";
import { useServices, useCatalogue } from "@/data/live";
import { useLiveContact } from "@/hooks/useLiveContact";
import { recordPublicEnquiry } from "@/admin/store";
import { useLanguage } from "@/hooks/useLanguage";
import { EnquiryError } from "@/lib/public-enquiry";

export function formatWhatsAppLink(base: string, text: string) {
  try {
    const raw = (base || "").trim() || "https://wa.me/905459248042";
    const normalized = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : /^\+?\d+$/.test(raw.replace(/\s+/g, ""))
        ? `https://wa.me/${raw.replace(/\D/g, "")}`
        : `https://${raw}`;
    const url = new URL(normalized);
    url.searchParams.set("text", text);
    return url.toString();
  } catch {
    return `https://wa.me/905459248042?text=${encodeURIComponent(text)}`;
  }
}

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

export function buildWhatsAppEnquiryMessage(v: {
  name: string;
  topic: string;
  budget?: string;
  message: string;
  email?: string;
  phone?: string;
  receipt?: string;
}) {
  const parts: string[] = [
    `*Avrasya Properties - New Consultation Enquiry*`,
    v.receipt ? `*Ref:* ${v.receipt}` : "",
    "",
    `*Client:* ${v.name.trim()}`,
    v.phone?.trim() ? `*Phone:* ${v.phone.trim()}` : "",
    v.email?.trim() ? `*Email:* ${v.email.trim()}` : "",
    `*Topic / Interest:* ${v.topic.trim()}`,
    v.budget?.trim() ? `*Budget:* ${v.budget.trim()}` : "",
    "",
    `*Enquiry Message:*`,
    v.message.trim(),
  ];
  return parts.filter((x): x is string => typeof x === "string" && x !== "").join("\n");
}

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
  const [savedData, setSavedData] = useState<{
    name: string;
    email: string;
    phone: string;
    topic: string;
    budget: string;
    message: string;
    receipt: string;
  } | null>(null);

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
      setSavedData(null);
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
      setSavedData({ ...v, receipt: res.receipt });

      const waMsg = buildWhatsAppEnquiryMessage({
        receipt: res.receipt,
        name: v.name,
        email: v.email,
        phone: v.phone,
        topic: v.topic,
        budget: v.budget,
        message: v.message,
      });
      const waUrl = formatWhatsAppLink(contact.whatsapp, waMsg);

      try {
        if (typeof window !== "undefined" && process.env["NODE_ENV"] !== "test") {
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }
      } catch {
        /* popup blocker handling */
      }
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
    const waMsg = buildWhatsAppEnquiryMessage({
      receipt,
      name: savedData?.name || v.name,
      email: savedData?.email || v.email,
      phone: savedData?.phone || v.phone,
      topic: savedData?.topic || v.topic,
      budget: savedData?.budget || v.budget,
      message: savedData?.message || v.message,
    });
    const waUrl = formatWhatsAppLink(contact.whatsapp, waMsg);

    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border border-brass/60 bg-secondary/60 p-5 text-sm text-foreground outline-none space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <p className="kicker text-brass-text">{t.enquiry.successTitle}</p>
        </div>
        <p className="leading-relaxed">
          {t.enquiry.propertyReference} <strong className="font-mono text-base tracking-wide text-brass-text">{receipt}</strong>
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{t.enquiry.successNext}</p>

        {/* Message Summary Card */}
        <div className="rounded border border-border/60 bg-background/60 p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>Client:</span>
            <span className="font-medium text-foreground">{savedData?.name || v.name}</span>
          </div>
          {(savedData?.phone || v.phone) && (
            <div className="flex justify-between text-muted-foreground">
              <span>Phone / WhatsApp:</span>
              <span className="font-medium text-foreground">{savedData?.phone || v.phone}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Topic:</span>
            <span className="font-medium text-foreground">{savedData?.topic || v.topic}</span>
          </div>
          {(savedData?.budget || v.budget) && (
            <div className="flex justify-between text-muted-foreground">
              <span>Budget:</span>
              <span className="font-medium text-foreground">{savedData?.budget || v.budget}</span>
            </div>
          )}
          <div className="pt-1.5 text-muted-foreground border-t border-border/40">
            <span className="block font-medium text-foreground mb-0.5">Enquiry message present in inbox:</span>
            <p className="italic line-clamp-3 text-foreground/90">"{savedData?.message || v.message}"</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary inline-flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat on WhatsApp with Enquiry</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setReceipt("");
              setSavedData(null);
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
          <a className="underline underline-offset-2" href={formatWhatsAppLink(contact.whatsapp, buildWhatsAppEnquiryMessage(v))} target="_blank" rel="noreferrer">
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