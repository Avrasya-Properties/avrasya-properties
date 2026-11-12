import { useState, type ComponentType } from "react";
import {
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  Eye,
  ShieldCheck,
  Quote,
  Star,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Building2,
  Scale,
  KeyRound,
  Landmark,
  FileCheck,
  Gem,
  TrendingUp,
  Award,
  Compass,
} from "lucide-react";
import type { CmsPage, CmsSection, RepeatableCardItem } from "./types";

interface CmsLivePreviewProps {
  page: CmsPage;
  sections: CmsSection[];
  activeSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Scale,
  Building2,
  KeyRound,
  Landmark,
  FileCheck,
  Gem,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Award,
  Compass,
};

export function CmsLivePreview({
  page,
  sections,
  activeSectionId,
  onSelectSection,
}: CmsLivePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const visibleSections = [...sections]
    .filter((s) => s.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  const viewportWidthClass =
    viewport === "mobile"
      ? "max-w-[375px]"
      : viewport === "tablet"
        ? "max-w-[768px]"
        : "w-full max-w-[1280px]";

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Top Preview Controls Bar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-brass/15 px-2.5 py-0.5 text-xs font-semibold text-brass">
            <Eye className="size-3" />
            <span>Live Preview</span>
          </span>
          <span className="text-xs font-medium text-foreground">
            {page.title} ({visibleSections.length} sections)
          </span>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`rounded-md p-1.5 transition-colors ${
              viewport === "desktop"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Desktop view"
          >
            <Laptop className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`rounded-md p-1.5 transition-colors ${
              viewport === "tablet"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`rounded-md p-1.5 transition-colors ${
              viewport === "mobile"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Mobile view (375px)"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Canvas Container */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center">
        <div
          className={`${viewportWidthClass} transition-all duration-300 rounded-xl border border-border/80 bg-background shadow-lg overflow-hidden flex flex-col`}
          style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
        >
          {/* Mock Public Top Navbar */}
          <div className="flex h-14 items-center justify-between border-b border-[#DEE0DD] bg-[#F7F6F2] px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-[#163038]">AVRASYA</span>
              <span className="text-[10px] uppercase font-semibold text-[#C5A059] tracking-wider">
                Properties
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#163038]/80">
              <span className={page.slug === "home" ? "text-[#C5A059] font-bold" : ""}>Home</span>
              <span className={page.slug === "properties" ? "text-[#C5A059] font-bold" : ""}>
                Properties
              </span>
              <span className={page.slug === "services" ? "text-[#C5A059] font-bold" : ""}>
                Services
              </span>
              <span className={page.slug === "citizenship" ? "text-[#C5A059] font-bold" : ""}>
                Citizenship
              </span>
              <span className={page.slug === "about" ? "text-[#C5A059] font-bold" : ""}>About</span>
              <span className={page.slug === "contact" ? "text-[#C5A059] font-bold" : ""}>
                Contact
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#163038] px-3 py-1 text-[11px] font-medium text-white">
                Consultation
              </span>
            </div>
          </div>

          {/* Render Sections */}
          {visibleSections.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-muted-foreground">
                No visible sections published for this page. Add or unhide sections to preview
                layout.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {visibleSections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                const c = sec.content_json;
                const bgImage = c.background_image;
                const hasOverlay = c.background_overlay !== "none";

                return (
                  <section
                    key={sec.id}
                    onClick={() => onSelectSection?.(sec.id)}
                    className={`relative cursor-pointer transition-all ${
                      isActive
                        ? "ring-2 ring-brass ring-inset"
                        : "hover:outline-dashed hover:outline-1 hover:outline-brass/60"
                    } ${bgImage ? "text-white" : "text-[#163038]"}`}
                  >
                    {/* Background Image & Overlay */}
                    {bgImage && (
                      <div className="absolute inset-0 -z-10 overflow-hidden">
                        <img
                          src={bgImage}
                          alt=""
                          className="h-full w-full object-cover object-center"
                        />
                        {hasOverlay && (
                          <div
                            className={`absolute inset-0 ${
                              c.background_overlay === "light"
                                ? "bg-white/80 backdrop-blur-xs"
                                : "bg-[#163038]/85 backdrop-blur-xs"
                            }`}
                          />
                        )}
                      </div>
                    )}

                    <div className="relative mx-auto max-w-5xl px-6 py-16 sm:px-8">
                      {/* Active section indicator badge */}
                      {isActive && (
                        <div className="mb-4 inline-flex items-center gap-1 rounded bg-brass px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs">
                          <Sparkles className="size-3" />
                          <span>Currently Editing: {sec.section_key}</span>
                        </div>
                      )}

                      {/* Kicker */}
                      {c.kicker && (
                        <div className="mb-3">
                          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C5A059]">
                            {c.kicker}
                          </span>
                        </div>
                      )}

                      {/* Headline Title */}
                      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                        {sec.title || c.title}
                      </h2>

                      {/* Subtitle */}
                      {c.subtitle && (
                        <p
                          className={`mt-3 max-w-2xl text-sm leading-relaxed sm:text-base ${bgImage ? "text-white/80" : "text-muted-foreground"}`}
                        >
                          {c.subtitle}
                        </p>
                      )}

                      {/* Paragraphs */}
                      {Array.isArray(c.paragraphs) && c.paragraphs.length > 0 && (
                        <div
                          className={`mt-6 space-y-3 max-w-3xl text-sm leading-relaxed ${bgImage ? "text-white/85" : "text-foreground/80"}`}
                        >
                          {c.paragraphs.map((p, idx) => (
                            <p key={idx} className="whitespace-pre-line">
                              {p}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Repeatable Items Grid */}
                      {Array.isArray(c.repeatable_items) && c.repeatable_items.length > 0 && (
                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {c.repeatable_items.map((item: RepeatableCardItem) => {
                            if (item.type === "metric") {
                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-xl border p-5 backdrop-blur-sm transition-transform hover:-translate-y-0.5 ${
                                    bgImage
                                      ? "border-white/15 bg-white/5"
                                      : "border-border bg-card shadow-xs"
                                  }`}
                                >
                                  <div className="text-2xl font-bold tracking-tight text-[#C5A059] sm:text-3xl">
                                    {item.value}
                                  </div>
                                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider">
                                    {item.label}
                                  </div>
                                  {item.description && (
                                    <p className="mt-1.5 text-xs opacity-75">{item.description}</p>
                                  )}
                                </div>
                              );
                            }

                            if (item.type === "testimonial") {
                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-xl border p-5 backdrop-blur-sm flex flex-col justify-between ${
                                    bgImage
                                      ? "border-white/15 bg-white/5"
                                      : "border-border bg-card shadow-xs"
                                  }`}
                                >
                                  <div>
                                    <Quote className="size-5 text-[#C5A059] opacity-80 mb-2" />
                                    <p className="text-xs italic leading-relaxed">
                                      &ldquo;{item.quote}&rdquo;
                                    </p>
                                  </div>
                                  <div className="mt-4 flex items-center gap-2.5 pt-3 border-t border-border/40">
                                    {item.avatar ? (
                                      <img
                                        src={item.avatar}
                                        alt={item.author}
                                        className="size-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="size-8 rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center font-bold text-xs">
                                        {item.author?.[0] || "C"}
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-xs font-semibold">{item.author}</div>
                                      {item.title && (
                                        <div className="text-[10px] opacity-75">{item.title}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (item.type === "feature") {
                              const IconComponent: ComponentType<{ className?: string }> =
                                item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon]! : Star;
                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-xl border p-5 backdrop-blur-sm flex items-start gap-3.5 ${
                                    bgImage
                                      ? "border-white/15 bg-white/5"
                                      : "border-border bg-card shadow-xs"
                                  }`}
                                >
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#C5A059]/20 text-[#C5A059]">
                                    <IconComponent className="size-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold">{item.title}</div>
                                    <p className="mt-1 text-xs opacity-75 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })}
                        </div>
                      )}

                      {/* CTA Buttons */}
                      {c.cta_label && (
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                              c.cta_style === "secondary"
                                ? "border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10"
                                : "bg-[#C5A059] text-[#163038] hover:bg-[#C5A059]/90 shadow-sm"
                            }`}
                          >
                            <span>{c.cta_label}</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Embedded Enquiry Preview */}
                      {c.enquiry && (
                        <div className="mt-8 rounded-xl border border-dashed border-brass/50 bg-brass/5 p-4 text-xs">
                          <div className="font-semibold text-brass mb-1">
                            Embedded Public Enquiry Form Active
                          </div>
                          <p className="opacity-80">
                            Visitors can submit consultations directly from this section to the
                            admin inquiries inbox.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Mock Footer */}
          <div className="mt-auto border-t border-white/10 bg-[#163038] px-6 py-8 text-center text-xs text-white/60">
            <p>
              © {new Date().getFullYear()} Avrasya Properties Group. Luxury Real Estate & Advisory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
