import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AdminShell } from "@/admin/Shell";
import { useSession } from "@/admin/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Avrasya Property" }, { name: "robots", content: "noindex" }, { name: "description", content: "Avrasya Property team workspace (demo)." }, { property: "og:title", content: "Admin — Avrasya Property" }, { property: "og:description", content: "Avrasya Property team workspace (demo)." }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const user = useSession();
  const nav = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (ready && !user) nav({ to: "/admin/login", search: { redirect: href } }); }, [ready, user, href, nav]);
  if (!ready || !user) return null;
  return <AdminShell><Outlet /><Toaster /></AdminShell>;
}
