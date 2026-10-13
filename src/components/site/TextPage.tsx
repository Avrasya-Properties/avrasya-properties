import { Link } from "@tanstack/react-router";
import { PageIntro } from "./Chrome";

export function LegalDraft({ title, topics }: { title: string; topics: string[] }) {
  return (
    <>
      <PageIntro eyebrow="Legal · Draft pending approval" title={title}>
        <p>
          This document has not yet been approved by Avrasya Properties. Final wording will be
          published after legal review.
        </p>
      </PageIntro>
      <div className="container-site max-w-3xl py-14">
        <p className="rounded-sm border border-brass bg-warn-bg p-4 text-sm">
          Status: pending approved text. Nothing on this page should be read as a finalised policy.
        </p>
        <h2 className="mt-10 font-sans text-lg font-semibold">
          The approved version is expected to cover
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          {topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-10 text-sm">
          Questions in the meantime?{" "}
          <Link to="/contact" className="underline">
            Contact our team
          </Link>
          .
        </p>
      </div>
    </>
  );
}

export function Faq({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y border-y">
      {items.map(([q, a]) => (
        <details key={q} className="group">
          <summary className="flex min-h-[56px] items-center justify-between gap-4 py-4 font-medium">
            {q}
            <span className="text-brass transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="faq-body pb-5 text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  );
}

export const meta = (
  title: string,
  description: string,
  optionsOrPath?: string | { canonical?: string; image?: string; noindex?: boolean; path?: string }
) => {
  const options = typeof optionsOrPath === "string" ? { path: optionsOrPath } : optionsOrPath;
  const fullTitle = title.includes("Avrasya Properties") ? title : `${title} — Avrasya Properties`;
  const path = options?.path;
  const canonical = options?.canonical || (path !== undefined ? `https://avrasyaproperties.com${path.startsWith("/") ? "" : "/"}${path}` : "https://avrasyaproperties.com");
  const image = options?.image || "https://avrasyaproperties.com/images/properties/hero-main.jpg";
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "Avrasya Properties" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      ...(options?.noindex
        ? [{ name: "robots", content: "noindex, nofollow" }]
        : [{ name: "robots", content: "index, follow" }]),
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
};

