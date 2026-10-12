import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/admin/Shell";
import { useDB } from "@/admin/store";

export const Route = createFileRoute("/admin/projects/")({ component: Projects });

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Projects() {
  const db = useDB();
  const groups = Object.entries(
    db.properties.reduce<Record<string, typeof db.properties>>(
      (a, p) => ((a[p.project || "Unassigned"] ??= []).push(p), a),
      {},
    ),
  );
  return (
    <>
<<<<<<< HEAD
      <PageHead title="Projects" crumbs="Inventory" />
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Project</th>
              <th>District</th>
              <th className="text-right">Linked records</th>
              <th className="text-right">Available</th>
              <th className="text-right">Unknown</th>
              <th className="px-2 text-right">Sold</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(([name, ps]) => (
              <tr key={name} className="border-b last:border-0">
                <td className="p-2">
                  <Link
                    to="/admin/projects/$slug"
                    params={{ slug: slugify(name) }}
                    className="font-medium text-brass-text hover:underline"
                  >
                    {name}
                  </Link>
                </td>
                <td>{[...new Set(ps.map((p) => p.district).filter(Boolean))].join(", ") || "—"}</td>
                <td className="text-right tabular-nums">{ps.length}</td>
                <td className="text-right tabular-nums">
                  {ps.filter((p) => p.availability === "Available").length}
                </td>
                <td className="text-right tabular-nums">
                  {ps.filter((p) => p.availability === "Unknown").length}
                </td>
                <td className="px-2 text-right tabular-nums">
                  {ps.filter((p) => p.availability === "Sold").length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Counts are linked source records, not verified stock.
      </p>
=======
      <PageHead title="Developments" crumbs="Inventory" />
      <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Project</th><th>District</th><th className="text-right">Linked records</th><th className="text-right">Available</th><th className="text-right">Unknown</th><th className="px-2 text-right">Sold</th></tr></thead>
        <tbody>{groups.map(([name, ps]) => (
          <tr key={name} className="border-b last:border-0">
            <td className="p-2"><Link to="/admin/projects/$slug" params={{ slug: slugify(name) }} className="font-medium text-brass-text hover:underline">{name}</Link></td>
            <td>{[...new Set(ps.map((p) => p.district).filter(Boolean))].join(", ") || "—"}</td>
            <td className="text-right tabular-nums">{ps.length}</td>
            <td className="text-right tabular-nums">{ps.filter((p) => p.availability === "Available").length}</td>
            <td className="text-right tabular-nums">{ps.filter((p) => p.availability === "Unknown").length}</td>
            <td className="px-2 text-right tabular-nums">{ps.filter((p) => p.availability === "Sold").length}</td></tr>))}</tbody></table></div>
      <p className="mt-2 text-xs text-muted-foreground">Counts are linked source records, not verified stock.</p>
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f
    </>
  );
}
