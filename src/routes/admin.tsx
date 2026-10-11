import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AdminShell } from "@/admin/Shell";
import { useSession, useBackendStatus } from "@/admin/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Avrasya Property" }, { name: "robots", content: "noindex" }, { name: "description", content: "Avrasya Property staff workspace." }, { property: "og:title", content: "Admin — Avrasya Property" }, { property: "og:description", content: "Avrasya Property staff workspace." }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const user = useSession();
  const backend = useBackendStatus();
  const nav = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const isLogin = useRouterState({ select: (s) => s.location.pathname })  .match(/^\/admin\/(login|recover)$/) !== null;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (ready && !backend.loading && !user && !isLogin) nav({ to: "/admin/login", search: { redirect: href } }); }, [ready, backend.loading, user, href, nav, isLogin]);
  if (isLogin) return <Outlet />;
  if (!ready || backend.loading || !user) return <div role="status" className="p-8">Connecting to the workspace…</div>;
  return <AdminShell><Outlet /><Toaster /></AdminShell>;
}
