import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/services")({
  head: () => meta("Services", "Ten advisory services across a six-phase buyer journey, coordinated with qualified legal, tax and valuation professionals."),
  component: Services,
});

const TEN: [string, string][] = [
  ["Investment Advisory", "Goals, budget, family priorities and risk discussed before any shortlist."],
  ["Property Selection", "Shortlists, area comparisons and virtual-viewing coordination."],
  ["Citizenship Consultancy", "Preparing your questions and documents for qualified, current legal review."],
  ["Legal & Administrative Coordination", "Tax number, bank account, power of attorney, translation and notarisation steps."],
  ["Property Acquisition", "Purchase, payment and title-transfer coordination."],
  ["Residence Permit Support", "Document preparation and appointment coordination."],
  ["Property Management", "Handover, utilities, maintenance and furnishing arrangements."],
  ["Rental Strategy", "Rental positioning and tenant arrangements with local partners."],
  ["Resale Strategy", "Holding-period and resale planning discussions."],
  ["International Investor Support", "A consistent point of contact across languages and time zones."],
];

const PHASES: [string, string, string[]][] = [
  ["Pre-Investment Advisory", "Clarify purpose before property.", ["Goals, budget and family priorities", "Risk discussion", "Property shortlists and area comparisons", "Virtual viewing coordination", "Purchase-planning questions"]],
  ["Legal & Administrative Foundation", "Prepare the paperwork early.", ["Tax-number and bank-account steps", "Power of attorney", "Translation, notarisation and apostille", "Independent title and encumbrance checks", "Legal review and negotiations via qualified professionals"]],
  ["Property Acquisition", "Coordinate the transaction.", ["Purchase and payment coordination", "Title-transfer steps", "Valuation coordination", "Insurance questions"]],
  ["Residence & Citizenship Processing", "Support documentation; authorities decide.", ["Document preparation and support", "Appointment coordination and tracking", "Family eligibility questions for qualified advisers"]],
  ["Post-Acquisition & Wealth Management", "Keep ownership simple.", ["Tenant and management arrangements", "Maintenance and furnishing", "Rental positioning and resale support", "Portfolio discussions"]],
  ["Long-Term Family Security", "Plan beyond the purchase.", ["Inheritance, tax and legal referrals", "School and healthcare orientation", "Relocation and business-establishment questions"]],
];

function Services() {
  return (
    <>
      <PageIntro eyebrow="Advisory services" title={<>From first brief to <em>long-term ownership.</em></>}>
        <p>Ten familiar service categories, organised along a six-phase journey. Legal, tax and valuation work is coordinated with independent qualified professionals rather than delivered as guaranteed in-house services.</p>
      </PageIntro>
      <Margin label="Ten services">
        <div className="grid border-l border-t sm:grid-cols-2 lg:grid-cols-5">
          {TEN.map(([t, d], i) => (
            <div key={t} id={t.toLowerCase().replace(/\W+/g, "-")} className="border-b border-r bg-card p-5">
              <p className="text-xs text-brass-text">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-sm font-semibold">{t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Margin>
      <Margin label="Six-phase journey">
        <ol className="divide-y border-y">
          {PHASES.map(([t, s, items], i) => (
            <li key={t} className="grid gap-4 py-8 md:grid-cols-[4rem_1fr_1.4fr]">
              <span className="font-display text-3xl text-brass">{i + 1}</span>
              <div><h2 className="font-display text-2xl">{t}</h2><p className="mt-1 text-sm text-muted-foreground">{s}</p></div>
              <ul className="space-y-1.5 text-sm">{items.map((x) => <li key={x}>— {x}</li>)}</ul>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">Want the full overview? <Link to="/investment-catalog" className="underline">Request our investment catalog</Link>.</p>
      </Margin>
      <CtaBand />
    </>
  );
}
