import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEMO_PASSWORD, USERS, login, getSession } from "@/admin/store";
import { btnPrimary, field } from "@/admin/Shell";
export const Route = createFileRoute("/admin/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined }),
  head: () => ({ meta: [{ title: "Sign in — Avrasya Admin" }, { name: "robots", content: "noindex" }, { name: "description", content: "Demo sign-in for the Avrasya workspace." }, { property: "og:title", content: "Sign in — Avrasya Admin" }, { property: "og:description", content: "Demo sign-in for the Avrasya workspace." }] }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [help, setHelp] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, pw)) return setErr("Email or password is incorrect.");
    go();
  };
  const go = () => { const r = redirect && redirect.startsWith("/admin") && !redirect.startsWith("/admin/login") ? redirect : "/admin"; nav({ to: r as "/admin" }); };
  useEffect(() => { if (getSession()) go(); }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md rounded-md border bg-card p-6">
        <img src="/images/avrasya-logo.svg" alt="Avrasya Properties Group" className="mb-5 h-10 w-auto object-contain" />
        <h1 className="text-lg font-semibold">Sign in to the workspace</h1>
        <p className="mb-4 text-xs text-muted-foreground">Use fictional information only. Demo accounts, not secure authentication.</p>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">Email<input className={field} value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
          <label className="block text-sm">Password
            <div className="flex gap-2"><input className={field} value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} required />
              <button type="button" className="text-xs text-brass-text" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div>
          </label>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <button className={`${btnPrimary} w-full justify-center`}>Sign in</button>
        </form>
        <button className="mt-3 text-xs text-brass-text" onClick={() => setHelp(!help)}>Forgot demo password?</button>
        {help && <p className="mt-1 text-xs text-muted-foreground">No email is sent. All demo accounts share the password shown below.</p>}
        <table className="mt-4 w-full text-xs">
          <tbody>{USERS.map((u) => (
            <tr key={u.id} className="border-t"><td className="py-1.5 capitalize">{u.role}</td><td>{u.email}</td>
              <td><button className="text-brass-text" onClick={() => { setEmail(u.email); setPw(DEMO_PASSWORD); }}>Use</button></td></tr>))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted-foreground">Password: <code>{DEMO_PASSWORD}</code> · Permissions are demonstrations only.</p>
      </div>
    </div>
  );
}
