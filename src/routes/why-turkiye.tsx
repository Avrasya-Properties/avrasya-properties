import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/why-turkiye")({
  head: () => meta("Why Türkiye", "Istanbul's international setting, neighbourhood variety and family lifestyle — context for buyers considering property in Türkiye."),
  component: Why,
});

function Why() {
  return (
    <>
      <PageIntro eyebrow="Why Türkiye" title={<>A city bridging continents, with <em>distinct neighbourhoods.</em></>}>
        <p>Istanbul spans Europe and Asia. Choosing well means understanding everyday life, transport and building standards — not just a skyline.</p>
      </PageIntro>
      {[
        ["International setting", "A global city connecting Europe, Asia and the Middle East, with two international airports and long-standing business links."],
        ["Neighbourhood variety", "From central Şişli and Beşiktaş to coastal Ataköy and Asian-side Ataşehir and Ümraniye, each district offers a different daily rhythm."],
        ["Business connections", "Financial districts such as Maslak and Ataşehir sit alongside established commercial corridors."],
        ["Family lifestyle", "Education and healthcare options vary by district; we help you compile the right questions for each area."],
        ["Ownership planning", "Holding, rental and resale considerations deserve attention before purchase, not after."],
        ["Beyond Istanbul", "We also discuss Antalya, Ankara, Bursa and Izmir as advisory markets. We do not currently list properties there."],
      ].map(([t, d = ""]) => (
        <Margin key={t} label={t ?? ""}><p className="max-w-2xl font-display text-2xl leading-snug">{d}</p></Margin>
      ))}
      <div className="container-site pb-14"><Link to="/properties" className="btn btn-primary">Browse Istanbul offers</Link></div>
      <CtaBand />
    </>
  );
}
