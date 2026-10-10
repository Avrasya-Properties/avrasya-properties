import { createFileRoute,Link } from "@tanstack/react-router";
import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";
import { changePassword,logout } from "@/admin/store";
import { btnPrimary,field } from "@/admin/Shell";
export const Route=createFileRoute("/admin/recover")({component:Recover,head:()=>({meta:[{title:"Reset password — Avrasya"},{name:"robots",content:"noindex"}]})});
function Recover(){
 const [password,setPassword]=useState("");const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>{void supabase.auth.getSession().then(({data})=>setReady(!!data.session));const {data}=supabase.auth.onAuthStateChange((_event,session)=>setReady(!!session));return()=>data.subscription.unsubscribe();},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);try{await changePassword(password);await logout();setReady(false);setMessage("Password updated. Sign in with your new password.");}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}
 return <main className="mx-auto max-w-md space-y-4 p-8"><h1 className="text-xl font-semibold">Reset your password</h1><form onSubmit={submit} className="space-y-3"><label className="block">New password<input className={field} type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={!ready||busy} className={btnPrimary}>Update password</button></form><p role="status">{message||(!ready?"Open the reset link from your email to continue.":"Use at least 12 characters.")}</p><Link to="/admin/login" search={{redirect:undefined}} className="underline">Return to sign in</Link></main>;
}
