import { useEffect, type ReactNode } from "react";
import { useManagedPage } from "@/data/live";
import { sanitizeSafeUrl } from "@/lib/security";
import { Enquiry } from "./Enquiry";
import { ArrowRight, Quote } from "lucide-react";

interface RepeatableItem {
  id: string;
  type: "metric" | "testimonial" | "feature";
  label?: string;
  value?: string;
  description?: string;
  quote?: string;
  author?: string;
  title?: string;
  avatar?: string;
  icon?: string;
}

interface ManagedSection {
  title?: string | null;
  content_json: Record<string, any>;
}

export function ManagedPage({
  slug,
  children,
  secondary = false,
}: {
  slug: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  const q = useManagedPage(slug);

  useEffect(() => {
    if (!q.data?.published || !q.data.title) return;
    const previousTitle = document.title;
    document.title = q.data.title + " | Avrasya Properties";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const existed = !!meta,
      previous = meta?.content || "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = q.data.meta_description || "";
    return () => {
      document.title = previousTitle;
      if (existed) meta!.content = previous;
      else meta!.remove();
    };
  }, [q.data?.published, q.data?.title, q.data?.meta_description]);

  if (q.isError) {
    return (
      <>
        <div role="alert" className="container-site my-6 rounded border p-4 text-sm">
          This page's saved content is temporarily unavailable.{" "}
          <button className="underline" onClick={() => void q.refetch()}>
            Try again
          </button>
        </div>
        {children}
      </>
    );
  }

  if (!q.data || !q.data.published) return <>{children}</>;

  const visibleSections = (q.data.sections || []).filter(
    (s: ManagedSection) => s.content_json && s.content_json["is_visible"] !== false,
  );

  // If page has no authored visible sections, preserve default baseline layout cleanly
  if (visibleSections.length === 0) return <>{children}</>;

  const managedContent = (
    <article className="container-site max-w-4xl py-12">
      {secondary ? (
        <h2 className="headline text-3xl mb-6">{q.data.title}</h2>
      ) : (
        <h1 className="headline text-4xl mb-6">{q.data.title}</h1>
      )}
      {visibleSections.map((section: ManagedSection, i: number) => {
        const c = section.content_json || {};
        const title = section.title || c["title"];
        return (
          <section
            key={i}
            className="my-10 border-t border-border/40 pt-8 first:border-0 first:pt-0"
          >
            {c["kicker"] && (
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-2">
                {c["kicker"]}
              </span>
            )}
            {title && (
              <h3 className="mb-3 font-display text-2xl font-semibold text-[#163038]">{title}</h3>
            )}
            {c["subtitle"] && (
              <p className="mb-4 text-base leading-relaxed text-muted-foreground">
                {c["subtitle"]}
              </p>
            )}
            {Array.isArray(c["paragraphs"]) &&
              c["paragraphs"]
                .filter((p: unknown): p is string => typeof p === "string")
                .map((p: string, j: number) => (
                  <p
                    key={j}
                    className="mb-4 whitespace-pre-line text-muted-foreground leading-relaxed"
                  >
                    {p}
                  </p>
                ))}

            {/* Repeatable Cards (Metrics / Testimonials / Features) */}
            {Array.isArray(c["repeatable_items"]) && c["repeatable_items"].length > 0 && (
              <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c["repeatable_items"].map((item: RepeatableItem) => {
                  if (item.type === "metric") {
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-card p-5 shadow-xs"
                      >
                        <div className="text-2xl font-bold tracking-tight text-[#C5A059]">
                          {item.value}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wider">
                          {item.label}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-xs opacity-75">{item.description}</p>
                        )}
                      </div>
                    );
                  }
                  if (item.type === "testimonial") {
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs"
                      >
                        <Quote className="size-5 text-[#C5A059] opacity-80 mb-2" />
                        <p className="text-xs italic leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                        <div className="mt-3 border-t border-border/40 pt-2 text-xs font-semibold text-foreground">
                          {item.author}{" "}
                          {item.title && (
                            <span className="font-normal opacity-70">· {item.title}</span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-xs"
                    >
                      <div className="font-semibold text-sm">{item.title}</div>
                      {item.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA Button */}
            {c["cta_label"] && sanitizeSafeUrl(c["cta_link"]) && (
              <div className="mt-4">
                <a
                  href={sanitizeSafeUrl(c["cta_link"])}
                  className="inline-flex items-center gap-2 rounded-full bg-[#163038] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#10785F]"
                >
                  <span>{c["cta_label"]}</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </div>
            )}

            {/* Enquiry Form */}
            {c["enquiry"] === true && (
              <div className="mt-6">
                <Enquiry compact />
              </div>
            )}
          </section>
        );
      })}
    </article>
  );

  return (
    <>
      {children}
      {managedContent}
    </>
  );
}
