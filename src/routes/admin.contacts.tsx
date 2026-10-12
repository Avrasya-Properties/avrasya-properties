import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/admin/Shell";
import { normPhone, useDB, userName } from "@/admin/store";

export const Route = createFileRoute("/admin/contacts")({ component: Contacts });

function Contacts() {
  const db = useDB();
  const dupOf = (id: string) => {
    const c = db.contacts.find((x) => x.id === id)!;
    return db.contacts.filter(
      (o) =>
        o.id !== id &&
        (o.email.toLowerCase() === c.email.toLowerCase() ||
          normPhone(o.phone) === normPhone(c.phone)),
    );
  };
  return (
    <>
      <PageHead title="Contacts" crumbs="Sales & CRM" />
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Name</th>
              <th>Type</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Language</th>
              <th>Agent</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {db.contacts.map((c) => {
              const d = dupOf(c.id);
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{c.name}</td>
                  <td className="capitalize">{c.kind}</td>
                  <td>{c.email}</td>
                  <td className="tabular-nums">{c.phone}</td>
                  <td>{c.language}</td>
                  <td>{userName(c.agentId)}</td>
                  <td>
                    {d.length > 0 ? (
                      <span className="text-xs text-brass-text">
                        Possible duplicate of {d.map((x) => x.name).join(", ")} — review, not merged
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
