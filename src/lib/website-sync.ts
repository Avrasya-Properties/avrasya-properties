// Signals contain no client data. They refresh public reads after successful staff saves.
import { DEMO_MODE, publicSupabase } from "./supabase";
export const WEBSITE_CHANGED="avrasya:website-changed";
const CHANNEL="avrasya-website-changes";
const KEY="avrasya-website-revision";
export function websiteChanged(){
 if(typeof window==="undefined")return;
 window.dispatchEvent(new Event(WEBSITE_CHANGED));
 try{localStorage.setItem(KEY,crypto.randomUUID());}catch{}
 if(typeof BroadcastChannel!=="undefined"){const channel=new BroadcastChannel(CHANNEL);channel.postMessage("refresh");channel.close();}
}
export function watchWebsiteChanges(refresh:()=>void,options:{poll?:boolean;readRevision?:()=>Promise<string>}={}){
 let active=true,scheduled:ReturnType<typeof setTimeout>|undefined;
 const schedule=()=>{if(!active||scheduled!==undefined)return;scheduled=setTimeout(()=>{scheduled=undefined;if(active)refresh();},50);};
 const onStorage=(event:StorageEvent)=>{if(event.key===KEY)schedule();};
 window.addEventListener(WEBSITE_CHANGED,schedule);window.addEventListener("storage",onStorage);
 const channel=typeof BroadcastChannel!=="undefined"?new BroadcastChannel(CHANNEL):null;
 if(channel)channel.onmessage=schedule;
 let revision:string|undefined,busy=false,lastFallback=0;
 const read=options.readRevision||(async()=>{
  const {data,error}=await publicSupabase.from("website_revision").select("revision").eq("id","default").single();
  if(error||typeof data?.revision!=="string")throw error||new Error("Website revision unavailable");
  return data.revision;
 });
 const poll=async()=>{
  if(!active||busy||document.visibilityState==="hidden")return;
  busy=true;
  try{const next=await read();if(active&&next!==revision){revision=next;schedule();}}
  catch{if(active&&Date.now()-lastFallback>=30000){lastFallback=Date.now();schedule();}}
  finally{busy=false;}
 };
 const onFocus=()=>{schedule();void poll();};
 const enabled=options.poll??!DEMO_MODE;
 let timer:ReturnType<typeof setInterval>|undefined;
 if(enabled){void poll();timer=setInterval(()=>void poll(),5000);window.addEventListener("focus",onFocus);window.addEventListener("online",onFocus);document.addEventListener("visibilitychange",onFocus);}
 return()=>{active=false;clearTimeout(scheduled);clearInterval(timer);window.removeEventListener(WEBSITE_CHANGED,schedule);window.removeEventListener("storage",onStorage);window.removeEventListener("focus",onFocus);window.removeEventListener("online",onFocus);document.removeEventListener("visibilitychange",onFocus);channel?.close();};
}
export const PUBLIC_QUERY_KEYS=new Set(["published-catalogue","site-settings","website-page","catalogue-documents","services","faqs"]);
