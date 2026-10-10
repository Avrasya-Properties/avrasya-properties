import { createFileRoute, Link } from "@tanstack/react-router";
import { currencyTotals } from "@/admin/domain.js";
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
    const activeProps = db.properties.filter((p) => p.publication !== "Archived" && !["Sold", "Rented", "Off Market"].includes(p.availability));
    const listingTotals = currencyTotals(activeProps.filter((p) => p.priceType !== "on-request"));
    const cbiEligible = activeProps.filter((p) => p.cbiEligible === true);
    const cbiRatio = activeProps.length ? Math.round((cbiEligible.length / activeProps.length) * 100) : 0;
    const european = activeProps.filter((p) => p.side === "Europe");
    const asian = activeProps.filter((p) => p.side === "Asia");
    const unknownSide = activeProps.filter((p) => p.side !== "Europe" && p.side !== "Asia");

    // District breakdown
    const districtCounts: Record<string, number> = {};
    activeProps.forEach((p) => {
      const d = p.district || "Istanbul Unspecified";
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    });
    const districts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);

    // Average price / m2
    const propsWithArea = activeProps.filter((p) => p.type === "unit offer" && p.mode === "sale" && p.grossM2 && p.grossM2 > 0 && p.amount && p.amount > 0 && p.currency === "USD");
    const avgPriceM2 = propsWithArea.length
      ? Math.round(propsWithArea.reduce((sum, p) => sum + p.amount! / p.grossM2!, 0) / propsWithArea.length)
      : null;
    const openDeals = db.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
    const pipelineTotals = currencyTotals(openDeals);

    // Lead source distribution
    const sourceCounts: Record<string, number> = {};
    db.leads.forEach((l) => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });

    return {
      activeCount: activeProps.length,
      listingTotals,
      cbiCount: cbiEligible.length,
      cbiRatio,
      europeanCount: european.length,
      asianCount: asian.length,
      unknownSideCount: unknownSide.length,
      districts,
      avgPriceM2,
      openDealsCount: openDeals.length,
      pipelineTotals,
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advertised Listing Totals</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {Object.entries(metrics.listingTotals).map(([currency, amount]) => <span key={currency} className="block">{fmtMoney(amount, currency)}</span>)}
            {Object.keys(metrics.listingTotals).length === 0 && "No priced listings"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metrics.activeCount} listing records · currencies separate · offers may overlap</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recorded Eligibility Flags</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
            {metrics.cbiRatio}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metrics.cbiCount} flagged records · price alone does not verify eligibility</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Price / m²</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {metrics.avgPriceM2 === null ? "—" : fmtMoney(metrics.avgPriceM2, "USD")} <span className="text-xs font-normal text-muted-foreground">/ m²</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">USD individual sale offers with recorded gross area only</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Deal Pipeline</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {Object.entries(metrics.pipelineTotals).map(([currency, amount]) => <span key={currency} className="block">{fmtMoney(amount, currency)}</span>)}
            {Object.keys(metrics.pipelineTotals).length === 0 && "No agreed amounts"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metrics.openDealsCount} open demo opportunities · currencies separate</p>
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
                      {count} records ({pct}%)
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
                  {Math.round((metrics.europeanCount / Math.max(1, metrics.activeCount)) * 100)}% of portfolio
                </p>
              </div>
              <div className="rounded-lg border p-4 bg-muted/20 text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asian Side</p>
                <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{metrics.asianCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((metrics.asianCount / Math.max(1, metrics.activeCount)) * 100)}% of portfolio
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{metrics.unknownSideCount} records have an unconfirmed continental side.</p>
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
