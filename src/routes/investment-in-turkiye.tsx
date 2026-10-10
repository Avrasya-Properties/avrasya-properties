import { createFileRoute } from "@tanstack/react-router";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/investment-in-turkiye")({
  head: () => meta("Investing in Türkiye", "A practical buyer journey for foreign purchasers of Turkish property, from brief and shortlist to title transfer and ownership."),
  component: Invest,
});

const STEPS: [string, string][] = [
  ["Define the brief", "Purpose (home, rental, long-term holding), budget, family needs and timeline."],
  ["Shortlist and compare", "Compare districts and projects; separate developer claims from documented facts."],
  ["Prepare administration", "Tax number, Turkish bank account and, if needed, power of attorney with translation and notarisation."],
  ["Independent checks", "Title deed and encumbrance review, valuation and contract review by qualified professionals."],
  ["Payment and transfer", "Documented payments and title-transfer appointment coordination."],
  ["Ownership", "Handover, utilities, management, rental or resale planning."],
];

function Invest() {
  return (
    <>
      <PageIntro eyebrow="Buyer journey" title={<>Investing in Türkiye, <em>step by step.</em></>}>
        <p>A clear sequence helps foreign buyers avoid surprises. Each step below is coordinated with you and, where relevant, with independent professionals.</p>
      </PageIntro>
      <Margin label="The journey">
        <ol className="grid gap-px bg-border md:grid-cols-2">
          {STEPS.map(([t, d], i) => <li key={t} className="bg-card p-6"><p className="eyebrow">Stage {String(i + 1).padStart(2, "0")}</p><h2 className="mt-2 font-sans text-lg font-semibold">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}
        </ol>
      </Margin>
      <Margin label="Practical considerations">
        <ul className="space-y-4 text-muted-foreground">
          <li><strong className="text-foreground">Prices are offers, not valuations.</strong> Advertised prices can change; confirm the current figure and what it includes.</li>
          <li><strong className="text-foreground">Area bases differ.</strong> Gross and net areas are not interchangeable — always ask which is quoted.</li>
          <li><strong className="text-foreground">Currency.</strong> Some offers are quoted in TRY instalments; conversions depend on dates and rates.</li>
          <li><strong className="text-foreground">Delivery dates.</strong> Off-plan timelines are project statements; check the contract terms.</li>
          <li><strong className="text-foreground">Rental and return claims.</strong> Treat projected yields or guarantees as marketing until documented.</li>
        </ul>
      </Margin>
      <CtaBand />
    </>
  );
}
