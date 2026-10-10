import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/Chrome";
import { Enquiry } from "@/components/site/Enquiry";
import { meta } from "@/components/site/TextPage";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact & consultation", "Contact Avrasya Properties in Istanbul by WhatsApp, phone or email to discuss a property brief or service."),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageIntro eyebrow="Contact" title={<>Start a <em>conversation.</em></>}>
        <p>Compose your enquiry below; it opens as a WhatsApp draft you can review before sending. Or reach us directly.</p>
      </PageIntro>
      <section className="container-site grid gap-10 py-14 lg:grid-cols-[1fr_26rem]">
        <div className="border bg-card p-6 md:p-8"><Enquiry /></div>
        <div className="space-y-6 text-sm">
          {[["WhatsApp", <a key="w" href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="underline">{CONTACT.phone}</a>],
            ["Phone", <a key="p" href={CONTACT.phoneHref} className="underline">{CONTACT.phone}</a>],
            ["Email", <a key="e" href={`mailto:${CONTACT.email}`} className="underline break-all">{CONTACT.email}</a>],
            ["Istanbul office", CONTACT.address],
            ["Operating company", CONTACT.company]].map(([k, v]) => (
            <div key={k as string} className="border-t border-ink pt-3"><p className="eyebrow">{k}</p><p className="mt-2 text-base">{v}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
