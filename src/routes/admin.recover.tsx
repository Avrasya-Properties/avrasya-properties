import { createFileRoute,Link } from "@tanstack/react-router";
import { useEffect,useRef,useState } from "react";
import { supabase } from "@/lib/supabase";
import { changePassword,logout } from "@/admin/store";
import { btnPrimary,field } from "@/admin/Shell";
export const Route=createFileRoute("/admin/recover")({component:Recover,head:()=>({meta:[{title:"Reset password — Avrasya"},{name:"robots",content:"noindex"}]})});
function Recover(){
 const [password,setPassword]=useState("");const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 const recovery=useRef<Promise<{ready:boolean;message:string}>|null>(null);
 useEffect(()=>{
  let active=true;
  if(!recovery.current){
   const hash=new URLSearchParams(window.location.hash.slice(1));const token=hash.get("token_hash");
   if(token&&hash.get("type")==="recovery"){
    window.history.replaceState(null,"",window.location.pathname);
    recovery.current=supabase.auth.verifyOtp({token_hash:token,type:"recovery"}).then(({error,data})=>({ready:!error&&!!data.session,message:error?"This recovery link has expired or was already used. Request a new link.":""}));
   }else recovery.current=supabase.auth.getSession().then(({data})=>({ready:!!data.session,message:""}));
  }
  void recovery.current.then(result=>{if(active){setReady(result.ready);setMessage(result.message);}}).catch(()=>{if(active)setMessage("Recovery is temporarily unavailable. Please try again.");});
  const {data}=supabase.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT")setReady(false);});
  return()=>{active=false;data.subscription.unsubscribe();};
 },[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);try{await changePassword(password);await logout();setReady(false);setMessage("Password updated. Sign in with your new password.");}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}
 return <main className="mx-auto max-w-md space-y-4 p-8"><h1 className="text-xl font-semibold">Reset your password</h1><form onSubmit={submit} className="space-y-3"><label className="block">New password<input className={field} type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={!ready||busy} className={btnPrimary}>Update password</button></form><p role="status">{message||(!ready?"Open the reset link from your email to continue.":"Use at least 12 characters.")}</p><Link to="/admin/login" search={{redirect:undefined}} className="underline">Return to sign in</Link></main>;
}
