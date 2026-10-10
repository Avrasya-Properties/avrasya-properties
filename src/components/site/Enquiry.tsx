import { useState } from "react";
import { properties } from "@/data/properties";
import { createInquiry } from "@/admin/store";
import { useLiveContact } from "@/hooks/useLiveContact";

const SERVICES = ["General consultation", "Investment Advisory", "Property Selection", "Citizenship Consultancy", "Legal & Administrative Coordination", "Property Acquisition", "Residence Permit Support", "Property Management", "Rental Strategy", "Resale Strategy", "International Investor Support", "Investment catalog request"];

export function buildMessage(v: { name: string; topic: string; budget: string; message: string }) {
  return [`Hello Avrasya Properties, my name is ${v.name.trim()}.`, `Enquiry: ${v.topic}`, v.budget.trim() && `Budget: ${v.budget.trim()}`, "", v.message.trim()].filter((x): x is string => typeof x === "string" && x !== "").join("\n");
}

export function Enquiry({ defaultTopic, compact }: { defaultTopic?: string; compact?: boolean }) {
  const contact = useLiveContact();
  const [v, setV] = useState({ name: "", topic: defaultTopic ?? "General consultation", budget: "", message: "" });
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (v.name.trim().length < 2) return setErr("Please add your name.");
    if (v.message.trim().length < 5) return setErr("Please add a short message.");
    setErr(null);
    try {
      createInquiry({
        name: v.name.trim(),
        email: "",
        phone: "",
        topic: v.topic,
        budget: v.budget.trim(),
        message: v.message.trim(),
        source: "Website Consultation",
      });
    } catch {
      /* ignore if offline */
    }
    const waUrl = `${contact.whatsapp}?text=${encodeURIComponent(buildMessage(v))}`;
    window.open(waUrl, "_blank", "noopener");
  }

  const label = "eyebrow !text-muted-foreground !text-[0.65rem] block mb-1.5";
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="enq-name" className={label}>Your full name *</label>
        <input id="enq-name" className="field" value={v.name} onChange={set("name")} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="enq-topic" className={label}>Property or service</label>
        <select id="enq-topic" className="field" value={v.topic} onChange={set("topic")}>
          {defaultTopic && !SERVICES.includes(defaultTopic) && <option>{defaultTopic}</option>}
          <optgroup label="Services">{SERVICES.map((s) => <option key={s}>{s}</option>)}</optgroup>
          {!compact && <optgroup label="Offers & projects">{properties.map((p) => <option key={p.slug}>{p.marketing_title}</option>)}</optgroup>}
        </select>
      </div>
      <div>
        <label htmlFor="enq-budget" className={label}>Budget (optional)</label>
        <input id="enq-budget" className="field" value={v.budget} onChange={set("budget")} placeholder="e.g. USD 400,000" />
      </div>
      <div>
        <label htmlFor="enq-msg" className={label}>Message *</label>
        <textarea id="enq-msg" className="field min-h-28" value={v.message} onChange={set("message")} />
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <button type="submit" className="btn btn-primary w-full">Continue in WhatsApp →</button>
      <p className="text-xs text-muted-foreground">
        Opens WhatsApp with your draft for you to review and send. Prefer email? Write to{" "}
        <a className="underline" href={`mailto:${contact.email}?subject=${encodeURIComponent(v.topic)}`}>{contact.email}</a> or call{" "}
        <a className="underline" href={contact.phoneHref}>{contact.phone}</a>.
      </p>
    </form>
  );
}
