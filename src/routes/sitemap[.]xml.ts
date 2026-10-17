import { createFileRoute } from "@tanstack/react-router";
import { loadCatalogue, loadPublicSettings } from "@/data/live";
import { normalizeRegions, publicRegions } from "@/data/regions";

const DEFAULT_SITE = "https://avrasyaproperties.com";
const STATIC_PAGES: [path: string, priority: string, freq: string][] = [
  ["/", "1.0", "daily"], ["/properties", "0.9", "daily"], ["/calculator", "0.8", "weekly"], ["/citizenship", "0.8", "weekly"],
  ["/why-turkiye", "0.7", "weekly"], ["/investment-in-turkiye", "0.7", "weekly"], ["/services", "0.7", "weekly"], ["/about", "0.6", "monthly"],
  ["/contact", "0.6", "monthly"], ["/investment-catalog", "0.6", "monthly"], ["/privacy-policy", "0.2", "yearly"], ["/terms", "0.2", "yearly"],
  ["/cookie-policy", "0.2", "yearly"], ["/investment-disclaimer", "0.2", "yearly"],
];
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Built from published data on each request so new regions and listings are discoverable without a redeploy.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let site = DEFAULT_SITE;
        let degraded = false;
        const urls: { loc: string; priority: string; freq: string; lastmod?: string }[] = STATIC_PAGES.map(([p, priority, freq]) => ({ loc: p, priority, freq }));
        try {
          const settings = await loadPublicSettings();
          if (typeof settings.siteUrl === "string" && /^https:\/\/[^\s/]+$/.test(settings.siteUrl.replace(/\/$/, ""))) site = settings.siteUrl.replace(/\/$/, "");
          for (const r of publicRegions(normalizeRegions(settings.regions, settings.districts))) urls.push({ loc: `/regions/${r.slug}`, priority: "0.8", freq: "weekly" });
          for (const p of await loadCatalogue()) urls.push({ loc: `/properties/${p.slug}`, priority: "0.7", freq: "weekly" });
        } catch {
          // Keep the static pages if the database is briefly unavailable, and do not let caches keep that thin copy.
          degraded = true;
        }
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${esc(site + u.loc)}</loc><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`).join("\n") + `\n</urlset>\n`;
        return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": degraded ? "no-store" : "public, max-age=900, s-maxage=900" } });
      },
    },
  },
});