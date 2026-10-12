<<<<<<< HEAD
import { useState } from "react";
import { properties, useLiveProperties } from "@/data/properties";
import { createInquiry } from "@/admin/store";
import { useLiveContact } from "@/hooks/useLiveContact";

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

export function buildMessage(v: { name: string; topic: string; budget: string; message: string }) {
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

export function Enquiry({ defaultTopic, compact }: { defaultTopic?: string; compact?: boolean }) {
  const contact = useLiveContact();
  const liveProperties = useLiveProperties();
  const [v, setV] = useState({
    name: "",
    topic: defaultTopic ?? "General consultation",
    budget: "",
    message: "",
  });
  const [hp, setHp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const set =
    (k: keyof typeof v) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setV({ ...v, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (hp.trim().length > 0) {
      // Bot detected via honeypot — silently ignore
      return;
    }
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
      {/* Bot Honeypot Defense */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website_url_hp">Leave this field blank</label>
        <input
          id="website_url_hp"
          name="website_url_hp"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="enq-name" className={label}>
          Your full name *
        </label>
        <input
          id="enq-name"
          className="field"
          value={v.name}
          onChange={set("name")}
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="enq-topic" className={label}>
          Property or service
        </label>
        <select id="enq-topic" className="field" value={v.topic} onChange={set("topic")}>
          {defaultTopic && !SERVICES.includes(defaultTopic) && <option>{defaultTopic}</option>}
          <optgroup label="Services">
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </optgroup>
          {!compact && (
            <optgroup label="Offers & projects">
              {(liveProperties.length > 0 ? liveProperties : properties).map((p) => (
                <option key={p.slug}>{p.marketing_title}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      <div>
        <label htmlFor="enq-budget" className={label}>
          Budget (optional)
        </label>
        <input
          id="enq-budget"
          className="field"
          value={v.budget}
          onChange={set("budget")}
          placeholder="e.g. USD 400,000"
        />
      </div>
      <div>
        <label htmlFor="enq-msg" className={label}>
          Message *
        </label>
        <textarea
          id="enq-msg"
          className="field min-h-28"
          value={v.message}
          onChange={set("message")}
        />
      </div>
      {err && (
        <p role="alert" className="text-sm text-destructive">
          {err}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full">
        Continue in WhatsApp →
      </button>
      <p className="text-xs text-muted-foreground">
        Opens WhatsApp with your draft for you to review and send. Prefer email? Write to{" "}
        <a
          className="underline"
          href={`mailto:${contact.email}?subject=${encodeURIComponent(v.topic)}`}
        >
          {contact.email}
        </a>{" "}
        or call{" "}
        <a className="underline" href={contact.phoneHref}>
          {contact.phone}
        </a>
        .
      </p>
    </form>
  );
=======
import { useEffect,useId,useRef,useState } from "react";
import { DEMO_MODE,publicSupabase } from "@/lib/supabase";
import { useServices,useCatalogue } from "@/data/live";
import { useLiveContact } from "@/hooks/useLiveContact";
const SERVICES=["General consultation","Investment Advisory","Property Selection","Citizenship Consultancy","Legal & Administrative Coordination","Property Acquisition","Residence Permit Support","Property Management","Rental Strategy","Resale Strategy","International Investor Support","Investment catalog request"];
export function buildMessage(v:{name:string;topic:string;budget:string;message:string}){return [`Hello Avrasya Properties, my name is ${v.name.trim()}.`,`Enquiry: ${v.topic}`,v.budget.trim()&&`Budget: ${v.budget.trim()}`,"",v.message.trim()].filter((x):x is string=>typeof x==="string"&&x!=="").join("\n");}
export function Enquiry({defaultTopic,compact,propertySlug,preview=false}:{defaultTopic?:string;compact?:boolean;propertySlug?:string;preview?:boolean}){
 const servicesQuery=useServices();const services=DEMO_MODE?SERVICES:["General consultation",...(servicesQuery.data||[]).map(s=>s.title)];
 const previousTopic=useRef(defaultTopic);
 const contact=useLiveContact();const catalogue=useCatalogue();const id=useId();const submission=useRef<string|null>(null);
 const [v,setV]=useState({name:"",email:"",phone:"",topic:defaultTopic||"General consultation",budget:"",message:"",website:""});
 const [consent,setConsent]=useState(false);const [busy,setBusy]=useState(false);const [err,setErr]=useState<string|null>(null);const [receipt,setReceipt]=useState("");
 const set=(key:keyof typeof v)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>{setV({...v,[key]:e.target.value});submission.current=null;setReceipt("");};
 useEffect(()=>{const old=previousTopic.current;setV(v=>v.topic===old?{...v,topic:defaultTopic||"General consultation"}:v);previousTopic.current=defaultTopic;},[defaultTopic]);
 async function submit(e:React.FormEvent){e.preventDefault();if(preview)return;setErr(null);if(v.name.trim().length<2)return setErr("Please add your name.");if(v.message.trim().length<5)return setErr("Please add a short message.");
 if(DEMO_MODE){window.open(contact.whatsapp+"?text="+encodeURIComponent(buildMessage(v)),"_blank","noopener");return;}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))return setErr("Please enter a valid email.");if(v.phone.replace(/\D/g,"").length<7)return setErr("Please add a contact phone number.");if(!consent)return setErr("Please consent to being contacted.");
 setBusy(true);try{submission.current??=crypto.randomUUID();const property=catalogue.properties.find(r=>r.marketing_title===v.topic);const {data,error}=await publicSupabase.functions.invoke("submit-enquiry",{body:{...v,consent,propertySlug:propertySlug||property?.slug,idempotencyKey:submission.current}});if(error)throw new Error("We could not submit your enquiry. Please try again, or contact us directly.");if(data?.error)throw new Error(data.error);if(typeof data?.receipt!=="string")throw new Error("No confirmation received. Please try again.");setReceipt(data.receipt);}catch(error){setErr((error as Error).message);}finally{setBusy(false);}}
 const label="eyebrow !text-muted-foreground !text-[0.65rem] block mb-1.5";
 return <form onSubmit={submit} noValidate className="space-y-4"><fieldset disabled={busy||preview} className="space-y-4">
 <div><label htmlFor={id+"-name"} className={label}>Your full name *</label><input id={id+"-name"} className="field" value={v.name} onChange={set("name")} autoComplete="name" maxLength={200}/></div>
 {!DEMO_MODE&&<div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor={id+"-email"} className={label}>Email *</label><input id={id+"-email"} className="field" type="email" autoComplete="email" value={v.email} onChange={set("email")} maxLength={254}/></div><div><label htmlFor={id+"-phone"} className={label}>Phone *</label><input id={id+"-phone"} className="field" type="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} maxLength={40}/></div></div>}
 <div><label htmlFor={id+"-topic"} className={label}>Property or service</label><select id={id+"-topic"} className="field" value={v.topic} onChange={set("topic")}>{defaultTopic&&!services.includes(defaultTopic)&&<option>{defaultTopic}</option>}<optgroup label="Services">{services.map(s=><option key={s}>{s}</option>)}</optgroup>{!compact&&<optgroup label="Offers & projects">{catalogue.properties.map(p=><option key={p.slug}>{p.marketing_title}</option>)}</optgroup>}</select></div>
 <div><label htmlFor={id+"-budget"} className={label}>Budget (optional)</label><input id={id+"-budget"} className="field" value={v.budget} onChange={set("budget")} placeholder="e.g. USD 400,000" maxLength={200}/></div>
 <div><label htmlFor={id+"-message"} className={label}>Message *</label><textarea id={id+"-message"} className="field min-h-28" value={v.message} onChange={set("message")} maxLength={4000}/></div>
 {!DEMO_MODE&&<><div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")}/></label></div><label className="flex gap-2 text-xs"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I agree to Avrasya contacting me about this enquiry.</label></>}
 {err&&<p role="alert" className="text-sm text-destructive">{err}</p>}{receipt?<p role="status" className="rounded border p-3 text-sm">Enquiry received. Reference: {receipt}. Our team will contact you.</p>:<button type="submit" className="btn btn-primary w-full">{busy?"Submitting…":DEMO_MODE?"Continue in WhatsApp →":"Send enquiry →"}</button>}
 <p className="text-xs text-muted-foreground">Prefer a direct conversation? <a className="underline" href={contact.whatsapp+"?text="+encodeURIComponent(buildMessage(v))} target="_blank" rel="noreferrer">WhatsApp</a>, <a className="underline" href={"mailto:"+contact.email}>{contact.email}</a> or <a className="underline" href={contact.phoneHref}>{contact.phone}</a>.</p>
 </fieldset></form>;
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f
}
