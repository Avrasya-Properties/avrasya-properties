import { createFileRoute,useNavigate } from "@tanstack/react-router";
import { useEffect,useState } from "react";
import { DEMO_ENABLED,DEMO_PASSWORD,USERS,login,getSession,useBackendStatus,resetPassword } from "@/admin/store";
import { btnPrimary,field } from "@/admin/Shell";
export const Route=createFileRoute("/admin/login")({
 validateSearch:(s:Record<string,unknown>)=>({redirect:typeof s["redirect"]==="string"?s["redirect"]:undefined}),
 head:()=>({meta:[{title:"Sign in — Avrasya Admin"},{name:"robots",content:"noindex"}]}),
 component:Login
});
function Login(){
 const {redirect}=Route.useSearch();const nav=useNavigate();const backend=useBackendStatus();
 const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [show,setShow]=useState(false);const [err,setErr]=useState("");const [notice,setNotice]=useState("");
 const go=()=>{const destination=redirect&&/^\/admin(?:\/|$)/.test(redirect)&&!redirect.startsWith("/admin/login")?redirect:"/admin";void nav({to:destination as "/admin"});};
 useEffect(()=>{setReady(true);if(getSession())go();},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setErr("");try{if(!await login(email,pw))throw new Error("Email or password is incorrect.");go();}catch(error){setErr((error as Error).message);}finally{setBusy(false);}}
 async function forgot(){if(DEMO_ENABLED){setNotice("Demo password: "+DEMO_PASSWORD);return;}setBusy(true);setErr("");try{await resetPassword(email);setNotice("If this email is registered, a password reset link will arrive.");}catch(error){setErr((error as Error).message);}finally{setBusy(false);}}
 return <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans"><div className="w-full max-w-md rounded-md border bg-card p-6">
 <img src="/images/avrasya-logo.svg" alt="Avrasya Properties" className="mb-5 h-10 w-auto object-contain"/><h1 className="text-lg font-semibold">Sign in to the workspace</h1>
 <p className="mb-4 text-xs text-muted-foreground">{DEMO_ENABLED?"Use fictional information only. Demo accounts, not secure authentication.":"Use your team email and password."}</p>
 <form data-ready={ready} onSubmit={submit}><fieldset disabled={!ready||busy} className="space-y-3">
 <label className="block text-sm">Email<input className={field} type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
 <label className="block text-sm">Password<div className="flex gap-2"><input className={field} type={show?"text":"password"} autoComplete="current-password" required value={pw} onChange={e=>setPw(e.target.value)}/><button type="button" className="text-xs text-brass-text" onClick={()=>setShow(!show)}>{show?"Hide":"Show"}</button></div></label>
 {(err||backend.error)&&<p role="alert" className="text-sm text-destructive">{err||backend.error}</p>}{notice&&<p role="status" className="text-sm">{notice}</p>}
 <button className={btnPrimary+" w-full justify-center"}>{busy?"Signing in…":"Sign in"}</button><button type="button" onClick={forgot} className="text-xs text-brass-text">Forgot password?</button>
 {DEMO_ENABLED&&<><table className="mt-4 w-full text-xs"><tbody>{USERS.map(u=><tr key={u.id} className="border-t"><td className="py-1.5 capitalize">{u.role}</td><td>{u.email}</td><td><button type="button" className="text-brass-text" onClick={()=>{setEmail(u.email);setPw(DEMO_PASSWORD);}}>Use</button></td></tr>)}</tbody></table><p className="text-xs text-muted-foreground">Password: <code>{DEMO_PASSWORD}</code></p></>}
 </fieldset></form></div></div>;
}
