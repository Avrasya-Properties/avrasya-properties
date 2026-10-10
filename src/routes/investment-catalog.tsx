import { createFileRoute } from "@tanstack/react-router";
import { Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { CONTACT, waLink } from "@/data/properties";

export const Route = createFileRoute("/investment-catalog")({
  head: () => meta("Investment catalog", "Request the Avrasya Properties investment catalog: a 17-page overview of our six-phase advisory journey."),
  component: Catalog,
});

/** Set to the approved public PDF URL once the client signs off the catalog for publication. */
const APPROVED_PDF_URL: string | null = null;

function Catalog() {
  return (
    <>
      <PageIntro eyebrow="Investment catalog" title={<>The Avrasya <em>investment catalog.</em></>}>
        <p>A 17-page overview of our six-phase journey, from pre-investment advisory to long-term family security.</p>
      </PageIntro>
      <Margin label="Inside">
        <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {["Pre-Investment Advisory", "Legal & Administrative Foundation", "Property Acquisition", "Residence & Citizenship Processing", "Post-Acquisition & Wealth Management", "Long-Term Family Security"].map((t, i) => (
            <li key={t} className="bg-card p-5"><p className="eyebrow">Phase {i + 1}</p><p className="mt-2 font-medium">{t}</p></li>
          ))}
        </ul>
      </Margin>
      <Margin label="Get a copy">
        {APPROVED_PDF_URL ? (
          <a href={APPROVED_PDF_URL} download className="btn btn-primary">Download catalog (PDF)</a>
        ) : (
          <div className="flex flex-wrap gap-3">
            <a href={waLink("Hello, please send me the Avrasya Properties investment catalog.")} target="_blank" rel="noreferrer" className="btn btn-primary">Request the catalog</a>
            <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Investment catalog request")}`} className="btn btn-outline">Request by email</a>
          </div>
        )}
        <p className="mt-4 text-sm text-muted-foreground">Sent personally by our team, together with current guidance for your situation.</p>
      </Margin>
    </>
  );
}
