// Signals contain no client data. They refresh public reads after successful staff saves.
export const WEBSITE_CHANGED="avrasya:website-changed";
const CHANNEL="avrasya-website-changes";
const KEY="avrasya-website-revision";
export function websiteChanged(){
 if(typeof window==="undefined")return;
 window.dispatchEvent(new Event(WEBSITE_CHANGED));
 try{localStorage.setItem(KEY,crypto.randomUUID());}catch{}
 if(typeof BroadcastChannel!=="undefined"){const channel=new BroadcastChannel(CHANNEL);channel.postMessage("refresh");channel.close();}
}
export function watchWebsiteChanges(refresh:()=>void){
 const onStorage=(event:StorageEvent)=>{if(event.key===KEY)refresh();};
 window.addEventListener(WEBSITE_CHANGED,refresh);window.addEventListener("storage",onStorage);
 const channel=typeof BroadcastChannel!=="undefined"?new BroadcastChannel(CHANNEL):null;
 if(channel)channel.onmessage=()=>refresh();
 return()=>{window.removeEventListener(WEBSITE_CHANGED,refresh);window.removeEventListener("storage",onStorage);channel?.close();};
}
export const PUBLIC_QUERY_KEYS=new Set(["published-catalogue","site-settings","website-page","catalogue-documents","services","faqs"]);
