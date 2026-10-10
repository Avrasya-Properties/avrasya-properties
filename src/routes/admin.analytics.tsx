import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { 
  Building2, 
  DollarSign, 
  Globe2, 
  Layers, 
  MapPin, 
  Percent, 
  PieChart, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { PageHead, Status, btnGhost } from "@/admin/Shell";
import { fmtMoney, useDB } from "@/admin/store";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

export function AdminAnalyticsPage() {
  const db = useDB();

  const metrics = useMemo(() => {
    const activeProps = db.properties.filter((p) => p.availability !== "Sold");
    
    // Total gross value in USD
    const totalValueUsd = activeProps.reduce((sum, p) => {
      if (!p.amount) return sum;
      if (p.currency === "USD") return sum + p.amount;
      if (p.currency === "EUR") return sum + p.amount * 1.08;
      if (p.currency === "TRY") return sum + p.amount / 36.5;
      return sum;
    }, 0);

    // CBI eligible count & ratio
    const cbiEligible = activeProps.filter((p) => (p.amount ?? 0) >= 400000 && p.currency === "USD");
    const cbiRatio = activeProps.length ? Math.round((cbiEligible.length / activeProps.length) * 100) : 0;

    // Side distribution
    const european = activeProps.filter((p) => p.side !== "Asia");
    const asian = activeProps.filter((p) => p.side === "Asia");

    // District breakdown
    const districtCounts: Record<string, number> = {};
    activeProps.forEach((p) => {
      const d = p.district || "Istanbul Unspecified";
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    });
    const districts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);

    // Average price / m2
    const propsWithArea = activeProps.filter((p) => (p.grossM2 || p.netM2 || p.areaM2) && p.amount && p.currency === "USD");
    const avgPriceM2 = propsWithArea.length
      ? Math.round(
          propsWithArea.reduce((sum, p) => sum + p.amount! / (p.grossM2 || p.netM2 || p.areaM2)!, 0) /
            propsWithArea.length
        )
      : 0;

    // Pipeline summary
    const openDeals = db.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
    const totalPipelineUsd = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Lead source distribution
    const sourceCounts: Record<string, number> = {};
    db.leads.forEach((l) => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });

    return {
      activeCount: activeProps.length,
      totalValueUsd,
      cbiCount: cbiEligible.length,
      cbiRatio,
      europeanCount: european.length,
      asianCount: asian.length,
      districts,
      avgPriceM2,
      openDealsCount: openDeals.length,
      totalPipelineUsd,
      sourceCounts,
    };
  }, [db]);

  return (
    <div className="space-y-6">
      <PageHead
        title="Portfolio Analytics & Intelligence"
        crumbs="Operations / Analytics"
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/properties" className={btnGhost}>
              Manage Inventory
            </Link>
          </div>
        }
      />

      {/* Top Level Metric KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portfolio Gross Value</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(metrics.totalValueUsd)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Across {metrics.activeCount} active residential assets</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CBI Qualification Share</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
            {metrics.cbiRatio}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metrics.cbiCount} units qualifying for $400k+ Citizenship</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Price / m²</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            ${metrics.avgPriceM2.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ m²</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Central corridor prime benchmarks</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Deal Pipeline</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(metrics.totalPipelineUsd)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metrics.openDealsCount} live contract & diligence stages</p>
        </div>
      </div>

      {/* Main Analysis Sections */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* District Distribution Bar Chart */}
        <section className="rounded-xl border bg-card p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">District Concentration Breakdown</h2>
              <p className="text-xs text-muted-foreground">Active inventory distribution across Istanbul prime zones</p>
            </div>
            <span className="text-xs text-brass font-medium">{metrics.districts.length} districts active</span>
          </div>

          <div className="space-y-3">
            {metrics.districts.map(([district, count]) => {
              const pct = Math.round((count / metrics.activeCount) * 100);
              return (
                <div key={district} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{district}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {count} units ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brass transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Geographic & Continental Split */}
        <section className="rounded-xl border bg-card p-6 lg:col-span-5 space-y-6">
          <div>
            <div className="border-b pb-3 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Continental Side Split</h2>
              <p className="text-xs text-muted-foreground">Bosphorus geographic distribution</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-4 bg-muted/20 text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">European Side</p>
                <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{metrics.europeanCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((metrics.europeanCount / metrics.activeCount) * 100)}% of portfolio
                </p>
              </div>
              <div className="rounded-lg border p-4 bg-muted/20 text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asian Side</p>
                <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{metrics.asianCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((metrics.asianCount / metrics.activeCount) * 100)}% of portfolio
                </p>
              </div>
            </div>
          </div>

          {/* Lead Source Acquisition */}
          <div>
            <div className="border-b pb-3 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead Acquisition Channels</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.sourceCounts).map(([src, count]) => (
                <div key={src} className="flex items-center justify-between text-xs py-1">
                  <span className="text-foreground">{src}</span>
                  <span className="font-semibold text-brass tabular-nums">{count} leads</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
