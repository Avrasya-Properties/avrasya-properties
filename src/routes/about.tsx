import { createFileRoute } from "@tanstack/react-router";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/about")({
  head: () => meta("About us", "Avrasya Properties is an Istanbul-based property-investment consultancy supporting international buyers from first brief to ownership."),
  component: About,
});

function About() {
  return (
    <>
      <PageIntro eyebrow="About Avrasya" title={<>An Istanbul point of contact, <em>end to end.</em></>}>
        <p>Avrasya Properties helps international buyers explore property opportunities in Türkiye, with an Istanbul-based point of contact from the initial brief through purchase coordination and ownership planning.</p>
      </PageIntro>
      <Margin label="Our base">
        <p className="font-display text-2xl leading-snug">Based in Üsküdar, on Istanbul's Asian shore, working with buyers and projects across the city.</p>
        <p className="mt-4 text-muted-foreground">Operating company: {CONTACT.company}. Address: {CONTACT.address}.</p>
      </Margin>
      <Margin label="Approach">
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {[
            ["Transparency", "Source material is presented as source material. Prices, availability and claims are confirmed before you commit."],
            ["A consistent contact", "One team follows your brief from shortlist to handover and beyond."],
            ["Cross-cultural communication", "Clear explanations of local process for buyers abroad."],
            ["Independent coordination", "Lawyers, valuers and tax advisers are independent professionals you can rely on separately."],
            ["Ongoing ownership support", "Management, rental and resale questions after the purchase."],
            ["International support", "Remote coordination for buyers who cannot be in Istanbul for every step."],
          ].map(([t, d]) => <div key={t} className="bg-card p-6"><h2 className="font-sans text-base font-semibold">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}
        </div>
      </Margin>
      <CtaBand />
    </>
  );
}
