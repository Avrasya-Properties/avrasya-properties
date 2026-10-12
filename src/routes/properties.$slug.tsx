import {createFileRoute,Link,notFound,redirect} from "@tanstack/react-router";
import {useCatalogue,loadCatalogue,resolveRedirect} from "@/data/live";
import {legacyRecords,TYPE_LABEL,locationText,priceDisplay} from "@/data/properties";
import {DEMO_MODE} from "@/lib/supabase";
import {useWhatsAppLink} from "@/hooks/useLiveContact";
import {MessageSquare} from "lucide-react";
import {PropertyDetails} from "@/components/site/PropertyDetails";
export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ params,context }) => {
    const records=await loadCatalogue();
    context.queryClient.setQueryData(["published-catalogue"],records);
    const r = records.find(x=>x.slug===params.slug);
    if (r) return { record: r, legacy: false };
    if (legacyRecords.some((l) => l.slug === params.slug)) return { record: null, legacy: true };
    if(!DEMO_MODE){const target=await resolveRedirect(params.slug);if(target)throw redirect({to:"/properties/$slug",params:{slug:target}});}
    throw notFound();
  },
  head: ({ loaderData }) => {
    const r = loaderData?.record;
    const title = r ? `${r.marketing_title} — Avrasya Properties Istanbul` : "Availability to confirm — Avrasya Properties";
    const desc = r
      ? `${r.layout_label ?? TYPE_LABEL[r.record_type]} in ${locationText(r)}. ${priceDisplay(r.price).main}.`
      : "This listing is being re-confirmed with the project.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(r ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: Detail,
});

function Detail(){
 const loaded=Route.useLoaderData();const catalogue=useCatalogue();
 if(!loaded.record)return <Legacy/>;
 const record=catalogue.data?catalogue.properties.find(r=>r.slug===loaded.record!.slug):loaded.record;
 if(!record)return <section className="container-site py-20"><h1 className="headline text-3xl">This listing is no longer published.</h1><Link to="/properties" className="btn btn-primary mt-5">Browse current properties</Link></section>;
 return <PropertyDetails r={record}/>;
}
function Legacy() {
  const waLink=useWhatsAppLink();
  return (
    <div className="container-site max-w-2xl py-24 text-center">
      <p className="eyebrow eyebrow-mark">Availability Under Review</p>
      <h1 className="headline mt-3 text-3xl">We are currently re-confirming this listing.</h1>
      <p className="mt-4 text-muted-foreground">
        This listing is currently undergoing title deed and availability re-verification with the developer. You may browse our current source-verified offers or enquire directly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/properties" className="btn btn-primary">
          Browse Active Offers
        </Link>
        <a
          href={waLink("Hello Avrasya, I'd like to ask about an earlier property listing.")}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline gap-1.5"
        >
          <MessageSquare className="h-4 w-4 text-brass" /> Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
}

