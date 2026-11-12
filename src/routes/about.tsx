import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { meta } from "@/components/site/TextPage";
import { PageIntro } from "@/components/site/Chrome";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import { useLiveContact } from "@/hooks/useLiveContact";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/about")({
  head: () =>
    meta(
      "About Avrasya Properties · Istanbul Real Estate & In-House Legal Advisory",
      "Your trusted Istanbul partner for handpicked homes, Turkish citizenship guidance, and in-house attorney legal review.",
    ),
  component: () => (
    <ManagedPage slug="about">
      <About />
    </ManagedPage>
  ),
});

const METRICS = [
  {
    target: 18,
    decimals: 0,
    suffix: "+",
    displayFallback: "18+",
    label: "Verified Developments",
  },
  {
    target: 7,
    decimals: 0,
    suffix: "",
    displayFallback: "7",
    label: "Client Languages Spoken",
  },
  {
    target: 4.8,
    decimals: 1,
    suffix: "/5",
    displayFallback: "4.8/5",
    label: "Client Satisfaction",
  },
  {
    target: 100,
    decimals: 0,
    suffix: "%",
    displayFallback: "100%",
    label: "In-House Attorney Title Review",
  },
] as const;

const APPROACH_STEPS = [
  {
    step: "01 — Understand & Shortlist",
    title: "Listening Before Recommending",
    description:
      "Every search starts with a clear brief — whether you are buying a family home on the Bosphorus, building a rental yield portfolio, or qualifying for the $400,000+ USD Turkish Citizenship program.",
  },
  {
    step: "02 — In-House Legal Due Diligence",
    title: "Reviewed by Avrasya’s In-House Attorney",
    description:
      "Before any reservation deposit is placed, Avrasya’s in-house attorney audits the title deed (Tapu), construction permits, developer standing, and encumbrance status.",
  },
  {
    step: "03 — Valuation & Direct Developer Pricing",
    title: "Transparent SPK Appraisal & Tapu Transfer",
    description:
      "We coordinate government-licensed SPK valuation reports, Foreign Exchange Purchase Certificates (DAB), and official Land Registry conveyance with zero hidden markups.",
  },
  {
    step: "04 — Citizenship & Key Handover",
    title: "Long-Term Stewardship After Closing",
    description:
      "From Certificate of Conformity and family passport filing to snagging inspections, furnishing, and tenant placement, we stay by your side long after the deed is signed.",
  },
] as const;

const EXPERTISE_ITEMS = [
  {
    title: "In-House Legal Review",
    subtitle: "Attorney-Led Conveyancing",
    description:
      "Every contract, Power of Attorney, Land Registry check, and citizenship dossier is prepared and supervised directly by Avrasya’s in-house attorney.",
    slot: PLACEHOLDER_IMAGES.aboutPage.expertiseCards[0]!,
  },
  {
    title: "Citizenship by Investment",
    subtitle: "$400,000+ USD Qualification",
    description:
      "Complete legal and procedural management for principal applicants, spouses, and dependent children under 18 — from DAB currency certificates to passport issuance.",
    slot: PLACEHOLDER_IMAGES.aboutPage.expertiseCards[1]!,
  },
  {
    title: "Turnkey Asset Management",
    subtitle: "Handover, Interiors & Rentals",
    description:
      "Comprehensive post-handover support including technical snagging, architect-curated furniture packages, utility setup, and long-term tenant management.",
    slot: PLACEHOLDER_IMAGES.aboutPage.expertiseCards[2]!,
  },
] as const;

const TEAM_MEMBERS = [
  {
    name: "Emre Karahan",
    role: "Managing Partner · Senior Portfolio Advisor",
    languages: "Turkish · English · Arabic",
    slot: PLACEHOLDER_IMAGES.aboutPage.teamMembers[0]!,
  },
  {
    name: "Av. Selin Aydın",
    role: "In-House Attorney · Head of Legal & Citizenship",
    languages: "Turkish · English · Russian",
    slot: PLACEHOLDER_IMAGES.aboutPage.teamMembers[1]!,
  },
  {
    name: "Tariq Al-Mansoor",
    role: "Director of International Client Relations",
    languages: "Arabic · English · Farsi · Bengali",
    slot: PLACEHOLDER_IMAGES.aboutPage.teamMembers[2]!,
  },
  {
    name: "Mei-Ling Chen",
    role: "Head of Valuation, Handover & Asia Desk",
    languages: "Chinese · English · Turkish",
    slot: PLACEHOLDER_IMAGES.aboutPage.teamMembers[3]!,
  },
] as const;

const PARTNERS = [
  {
    name: "The Initiate Consultancy",
    category: "Strategic & Cross-Border Advisory Partner",
  },
  {
    name: "Tez Gayrimenkul",
    category: "Real Estate Development & Valuation Partner",
  },
  {
    name: "Tez Tercüme",
    category: "Notarized & Sworn Translation Partner",
  },
  {
    name: "Merkad Turizm",
    category: "VIP Client Hospitality & Chauffeur Partner",
  },
  {
    name: "Ryans",
    category: "International Portfolio & Commercial Partner",
  },
] as const;

const CLIENT_LANGUAGES = [
  "Turkish",
  "English",
  "Arabic",
  "Russian",
  "Chinese",
  "Bengali",
  "Farsi",
] as const;

export function About() {
  const contact = useLiveContact();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const storySectionRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const approachSectionRef = useRef<HTMLElement>(null);
  const expertiseSectionRef = useRef<HTMLElement>(null);
  const teamSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // 1. Hero Word Blur Reveal (matching Bildora About `.framer-14375go`)
      if (heroRef.current) {
        const words = heroRef.current.querySelectorAll("[data-abt-hero-word]");
        gsap.fromTo(
          words,
          { opacity: 0, y: 14, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.65,
            stagger: 0.03,
            ease: "power3.out",
          },
        );
      }

      // 2. Our Story Slide-In Portrait (`x: -50 -> 0`) + Copy Reveal
      if (storySectionRef.current) {
        const img = storySectionRef.current.querySelector("[data-abt-story-img]");
        const copy = storySectionRef.current.querySelector("[data-abt-story-copy]");
        if (img) {
          gsap.fromTo(
            img,
            { opacity: 0, x: -50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: storySectionRef.current,
                start: "top 80%",
              },
            },
          );
        }
        if (copy) {
          gsap.fromTo(
            copy,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              delay: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: storySectionRef.current,
                start: "top 80%",
              },
            },
          );
        }
      }

      // 3. 4-Column Metrics Blur Reveal + Animated Count-Up (`.framer-4c1wl4`)
      if (metricsRef.current) {
        const cards = metricsRef.current.querySelectorAll("[data-abt-metric-card]");
        const nums = metricsRef.current.querySelectorAll<HTMLElement>("[data-abt-metric-num]");

        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: metricsRef.current,
              start: "top 85%",
            },
          },
        );

        nums.forEach((el, idx) => {
          const m = METRICS[idx];
          if (!m) return;
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: m.target,
            duration: 1.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: metricsRef.current,
              start: "top 85%",
              once: true,
            },
            onUpdate: () => {
              el.textContent = `${proxy.val.toFixed(m.decimals)}${m.suffix}`;
            },
            onComplete: () => {
              el.textContent = m.displayFallback;
            },
          });
        });
      }

      // 4. Our Approach Cards + Right Portrait (`x: 50 -> 0`)
      if (approachSectionRef.current) {
        const steps = approachSectionRef.current.querySelectorAll("[data-abt-approach-step]");
        const img = approachSectionRef.current.querySelector("[data-abt-approach-img]");

        if (steps.length) {
          gsap.fromTo(
            steps,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: approachSectionRef.current,
                start: "top 78%",
              },
            },
          );
        }

        if (img) {
          gsap.fromTo(
            img,
            { opacity: 0, x: 50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.95,
              ease: "power3.out",
              scrollTrigger: {
                trigger: approachSectionRef.current,
                start: "top 78%",
              },
            },
          );
        }
      }

      // 5. Our Expertise 3-Column Stagger Reveal
      if (expertiseSectionRef.current) {
        const cards = expertiseSectionRef.current.querySelectorAll("[data-abt-expertise-card]");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: expertiseSectionRef.current,
              start: "top 80%",
            },
          },
        );
      }

      // 6. Team Section 4-Column Stagger Reveal
      if (teamSectionRef.current) {
        const cards = teamSectionRef.current.querySelectorAll("[data-abt-team-card]");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: teamSectionRef.current,
              start: "top 82%",
            },
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const renderHeroWords = (text: string) =>
    text.split(" ").map((word, idx, arr) => (
      <React.Fragment key={idx}>
        <span data-abt-hero-word className="inline-block will-change-[transform,opacity,filter]">
          {word}
        </span>
        {idx < arr.length - 1 ? " " : ""}
      </React.Fragment>
    ));

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full overflow-hidden bg-background text-foreground"
    >
      {/* 1. Canonical Editorial PageIntro (Aligned with all other inner pages + Enlarged PageIdentityLineArt) */}
      <div ref={heroRef as React.RefObject<HTMLDivElement>} data-framer-name="Hero">
        <PageIntro
          eyebrow="About Avrasya · Istanbul Real Estate & Legal Advisory"
          title={
            <>
              Building More Than Structures. <em>Building Trust.</em>
            </>
          }
          aside={
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/90 backdrop-blur-xs">
                <Scale className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>In-House Attorney Governance</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/90 backdrop-blur-xs">
                <Globe2 className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>7 Advisory Languages</span>
              </div>
            </div>
          }
        >
          <p className="text-base leading-relaxed text-on-dark/90 sm:text-lg">
            {renderHeroWords(
              "Your trusted Istanbul partner for handpicked homes, Turkish citizenship guidance, and in-house legal peace of mind.",
            )}
          </p>
        </PageIntro>
      </div>

      {/* 2. Our Story Section + 4-Column Metrics */}
      <section
        ref={storySectionRef}
        data-framer-name="Our Story"
        className="container-site flex flex-col gap-[72px] pt-[72px] pb-[60px] lg:gap-[88px] lg:pt-[100px]"
      >
        {/* 2-Column Story Row */}
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:gap-[72px]">
          {/* Left Portrait Image */}
          <div
            data-abt-story-img
            className="relative h-[440px] w-full overflow-hidden rounded-[18px] border border-border/80 bg-[#DEE0DD]/40 shadow-[0_20px_50px_rgba(22,48,56,0.1)] sm:h-[520px] lg:h-[600px] lg:w-[46%] lg:shrink-0"
          >
            <img
              src={resolvePlaceholderSrc(PLACEHOLDER_IMAGES.aboutPage.storyPortrait)}
              alt={PLACEHOLDER_IMAGES.aboutPage.storyPortrait.alt}
              className="block h-full w-full object-cover object-center"
            />
          </div>

          {/* Right Story Content */}
          <div
            data-abt-story-copy
            className="flex flex-1 flex-col items-start justify-center gap-[24px] lg:gap-[30px]"
          >
            <p className="eyebrow">Our Story</p>

            <div className="flex flex-col gap-[20px]">
              <h2 className="font-display m-0 text-3xl font-semibold leading-[1.12] text-foreground sm:text-4xl lg:text-[44px]">
                From Ambitious Ideas to{" "}
                <em className="font-normal italic text-brass">Lasting Structures.</em>
              </h2>

              <div className="flex flex-col gap-[16px] text-[15px] leading-[1.7] text-muted-foreground">
                <p className="m-0">
                  Avrasya Properties was built around a simple conviction: international buyers in
                  Türkiye deserve the same rigor, contract transparency, and direct developer
                  pricing enjoyed by domestic institutional investors. From the earliest portfolio
                  brief to the final Land Registry signature, we work closely with families and
                  investors to deliver residences that perform over the long term.
                </p>
                <p className="m-0">
                  Headquartered in Mecidiyeköy, Şişli — at the crossroads of European Istanbul — our
                  multilingual advisors and Avrasya’s in-house attorney review every title deed, SPK
                  valuation report, and developer track record before a property ever reaches our
                  shortlist.
                </p>
              </div>
            </div>

            <a
              href="#our-approach"
              className="btn btn-primary inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium no-underline"
            >
              Discover Our Approach
            </a>
          </div>
        </div>

        {/* 4-Column Metrics Row (NO founding year per PDF Part 3) */}
        <div
          ref={metricsRef}
          data-framer-name="Metrics"
          className="grid w-full grid-cols-2 gap-6 border-t border-border pt-[44px] lg:grid-cols-4 lg:gap-[32px]"
        >
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              data-abt-metric-card
              className="card-elevate flex flex-col items-start justify-center gap-[8px] rounded-xl border border-border/80 bg-card p-6 text-left shadow-xs"
            >
              <span
                data-abt-metric-num
                className="font-display text-[36px] font-bold leading-[1.08] text-foreground tabular-nums sm:text-[42px] lg:text-[48px]"
              >
                {metric.displayFallback}
              </span>
              <span className="text-[13.5px] font-medium leading-[1.35] text-muted-foreground sm:text-[14.5px]">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Our Approach Section */}
      <section
        id="our-approach"
        ref={approachSectionRef}
        data-framer-name="Our Approach"
        className="border-y border-border/70 bg-card/60 py-[72px] lg:py-[96px]"
      >
        <div className="container-site flex flex-col items-center justify-between gap-12 lg:flex-row lg:gap-[72px]">
          {/* Left Column (4 process cards) */}
          <div className="flex w-full flex-col items-start gap-[24px] lg:w-[50%]">
            <p className="eyebrow">Our Approach</p>

            <h2 className="font-display m-0 text-3xl font-semibold leading-[1.12] text-foreground sm:text-4xl lg:text-[44px]">
              A Better Way to Buy,{" "}
              <em className="font-normal italic text-brass">From Start to Finish.</em>
            </h2>

            <div className="mt-2 flex w-full flex-col gap-[16px]">
              {APPROACH_STEPS.map((item) => (
                <div
                  key={item.step}
                  data-abt-approach-step
                  className="card-elevate flex flex-col gap-[8px] rounded-xl border border-border/80 bg-background p-[22px] shadow-xs transition-all hover:border-brass/60"
                >
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brass">
                    {item.step}
                  </span>
                  <h3 className="font-display m-0 text-[21px] font-semibold leading-[1.25] text-foreground">
                    {item.title}
                  </h3>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Portrait Image */}
          <div
            data-abt-approach-img
            className="relative h-[480px] w-full overflow-hidden rounded-[18px] border border-border/80 bg-[#DEE0DD]/40 shadow-[0_20px_50px_rgba(22,48,56,0.1)] sm:h-[600px] lg:h-[720px] lg:flex-1"
          >
            <img
              src={resolvePlaceholderSrc(PLACEHOLDER_IMAGES.aboutPage.approachPortrait)}
              alt={PLACEHOLDER_IMAGES.aboutPage.approachPortrait.alt}
              loading="lazy"
              className="block h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 4. Our Expertise 3-Column Section */}
      <section
        ref={expertiseSectionRef}
        data-framer-name="Our Expertise"
        className="container-site flex flex-col items-center gap-[48px] py-[72px] lg:py-[96px]"
      >
        <div className="flex max-w-[680px] flex-col items-center gap-[14px] text-center">
          <p className="eyebrow">Our Expertise</p>
          <h2 className="font-display m-0 text-3xl font-semibold leading-[1.12] text-foreground sm:text-4xl lg:text-[44px]">
            Experience That Turns Plans Into{" "}
            <em className="font-normal italic text-brass">Progress.</em>
          </h2>
          <p className="m-0 max-w-[540px] text-[15px] leading-[1.6] text-muted-foreground">
            We combine market intelligence, in-house legal representation, and post-handover
            management under one roof in Istanbul.
          </p>
        </div>

        {/* 3-Column Expertise Grid */}
        <div className="grid w-full grid-cols-1 gap-[28px] md:grid-cols-3">
          {EXPERTISE_ITEMS.map((item) => (
            <div
              key={item.title}
              data-abt-expertise-card
              className="card-elevate group flex flex-col gap-[20px] rounded-[16px] border border-border/80 bg-card p-[18px] shadow-xs transition-all hover:-translate-y-1 hover:border-brass/60"
            >
              <div className="relative h-[320px] w-full overflow-hidden rounded-[12px] bg-[#DEE0DD]/30 sm:h-[350px]">
                <img
                  src={resolvePlaceholderSrc(item.slot)}
                  alt={item.slot.alt}
                  loading="lazy"
                  className="block h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-[8px] px-1 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">
                  {item.subtitle}
                </span>
                <h3 className="font-display m-0 text-[24px] font-semibold leading-[1.2] text-foreground">
                  {item.title}
                </h3>
                <p className="m-0 text-[14px] leading-[1.6] text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Meet The Team Section */}
      <section
        ref={teamSectionRef}
        data-framer-name="Team"
        className="border-t border-border/70 bg-card/50 py-[72px] lg:py-[96px]"
      >
        <div className="container-site flex flex-col items-center gap-[48px]">
          <div className="flex max-w-[680px] flex-col items-center gap-[14px] text-center">
            <p className="eyebrow">Meet The Team</p>
            <h2 className="font-display m-0 text-3xl font-semibold leading-[1.12] text-foreground sm:text-4xl lg:text-[44px]">
              The People Behind Every{" "}
              <em className="font-normal italic text-brass">Acquisition.</em>
            </h2>
            <p className="m-0 max-w-[580px] text-[15px] leading-[1.6] text-muted-foreground">
              Our advisors and in-house legal counsel speak 7 languages —{" "}
              <strong className="font-medium text-foreground">{CLIENT_LANGUAGES.join(", ")}</strong>{" "}
              — guiding you clearly at every stage.
            </p>
          </div>

          {/* 4-Column Team Card Grid */}
          <div className="grid w-full grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                data-abt-team-card
                className="card-elevate group flex flex-col justify-between rounded-[16px] border border-border/80 bg-background p-[18px] transition-all duration-300 hover:-translate-y-1 hover:border-brass/60 hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[12px] bg-[#DEE0DD]/30">
                  <img
                    src={resolvePlaceholderSrc(member.slot)}
                    alt={member.slot.alt}
                    loading="lazy"
                    className="block h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-[6px]">
                  <h3 className="font-display m-0 text-[20px] font-semibold leading-[1.25] text-foreground">
                    {member.name}
                  </h3>
                  <p className="m-0 text-[13px] leading-[1.45] text-muted-foreground">
                    {member.role}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-medium text-brass">
                    <Globe2 className="h-3 w-3 shrink-0" />
                    <span>{member.languages}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. References & Partners + Credentials & Şişli Office Block (PDF Pages 12–13) */}
      <section className="border-t border-border bg-background py-[80px] lg:py-[104px]">
        <div className="container-site flex flex-col gap-[72px]">
          {/* References & Partners Block */}
          <div className="flex flex-col gap-[28px]">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">References &amp; Partners</p>
                <h2 className="font-display mt-2 text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl">
                  Trusted Institutional &amp; Service Network
                </h2>
              </div>
              <p className="max-w-md text-[14px] leading-[1.6] text-muted-foreground">
                We collaborate with established consultancy, valuation, sworn translation, and
                hospitality partners across Istanbul.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="card-elevate flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-card p-5 transition-colors hover:border-brass/60"
                >
                  <Building2 className="h-5 w-5 text-brass" />
                  <div>
                    <h3 className="font-display m-0 text-[17px] font-semibold text-foreground">
                      {partner.name}
                    </h3>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                      {partner.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials, Legal Governance & Şişli Office Block */}
          <div className="grid grid-cols-1 gap-8 rounded-[20px] bg-[#0E2228] p-8 text-white shadow-xl sm:p-12 lg:grid-cols-12">
            <div className="flex flex-col justify-between gap-6 lg:col-span-7">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C5A059]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Credentials &amp; Headquarters
                </span>
                <h2 className="font-display m-0 text-[30px] font-semibold leading-[1.15] text-white sm:text-[38px]">
                  Visit Our Şişli Advisory Desk in Central Istanbul
                </h2>
                <p className="m-0 max-w-xl text-[14.5px] leading-[1.65] text-white/80">
                  All legal due diligence, title deed checks, and citizenship filings are conducted
                  by Avrasya’s in-house attorney from our Mecidiyeköy headquarters. Fees depend on
                  the transaction — ask us for a clear written quote before you commit.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
                  <Award className="mb-2 h-5 w-5 text-[#C5A059]" />
                  <div className="text-[13px] font-medium text-white">
                    Real Estate Authorization Certificate
                  </div>
                  <p className="mt-1 text-[12px] text-white/70">
                    Ministry of Trade Registered Real Estate Enterprise · Certificate No. [Verified
                    on Request]
                  </p>
                </div>
                <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
                  <Scale className="mb-2 h-5 w-5 text-[#C5A059]" />
                  <div className="text-[13px] font-medium text-white">
                    In-House Legal &amp; Bar Governance
                  </div>
                  <p className="mt-1 text-[12px] text-white/70">
                    Contract review, Tapu conveyance &amp; citizenship filings handled by Avrasya’s
                    in-house attorney.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/contact"
                  className="inline-flex h-[46px] items-center justify-center rounded-full border border-white/20 bg-[#163038] px-7 text-[13.5px] font-medium text-white no-underline shadow-md transition-colors hover:bg-[#10785F]"
                >
                  Book Private Appointment
                </Link>
                <a
                  href="https://maps.google.com/?q=Mecidiyekoy+Mah.+Hark+Sk.+No:+6+A+34387+Sisli+Istanbul"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-[46px] items-center justify-center rounded-full border border-white/25 px-6 text-[13.5px] font-normal text-white no-underline transition-colors hover:bg-white/10"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* Right Office Contact Card */}
            <div className="flex flex-col justify-between gap-5 rounded-[14px] border border-white/12 bg-white/5 p-6 lg:col-span-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#C5A059]" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      Istanbul Office Address
                    </div>
                    <div className="mt-1 text-[14px] leading-snug text-white">
                      Mecidiyeköy Mah., Hark Sk. No: 6 A, 34387 Şişli/İstanbul
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-[#C5A059]" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      Office Hours
                    </div>
                    <div className="mt-1 text-[14px] leading-snug text-white">
                      Mon–Fri 09:30–18:30 TRT · Sat by private appointment
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-[#C5A059]" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      Phone &amp; WhatsApp
                    </div>
                    <a
                      href={contact.phoneHref}
                      className="mt-1 block text-[14px] text-white no-underline hover:text-[#C5A059]"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-[#C5A059]" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                      Direct Email
                    </div>
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-1 block text-[14px] text-white no-underline hover:text-[#C5A059]"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-[12px] text-white/75">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C5A059]" />
                  <span>7 Advisory Languages: {CLIENT_LANGUAGES.join(" · ")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const AboutPage = About;
