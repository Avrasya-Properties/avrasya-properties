import { useEffect, type ReactNode } from "react";
import { DEMO_MODE } from "@/lib/supabase";
import { useManagedPage } from "@/data/live";
import { Enquiry } from "./Enquiry";
interface ManagedSection {
  title?: string | null;
  content_json: Record<string, any>;
}

export function ManagedPage({slug,children,secondary=false}:{slug:string;children:ReactNode;secondary?:boolean}){
 const q=useManagedPage(slug);
 useEffect(()=>{
 if(!q.data?.published||!q.data.title)return;
 const previousTitle=document.title;document.title=q.data.title+" | Avrasya Properties";
 let meta=document.querySelector<HTMLMetaElement>('meta[name="description"]');const existed=!!meta,previous=meta?.content||"";
 if(!meta){meta=document.createElement("meta");meta.name="description";document.head.appendChild(meta);}
 meta.content=q.data.meta_description||"";
 return()=>{document.title=previousTitle;if(existed)meta!.content=previous;else meta!.remove();};
 },[q.data?.published,q.data?.title,q.data?.meta_description]);
 if(DEMO_MODE)return <>{children}</>;
 // Render default rich page content immediately without displaying a blocking loading screen
 if(q.isError)return <><div role="alert" className="container-site my-6 rounded border p-4 text-sm">This page's saved content is temporarily unavailable. <button className="underline" onClick={()=>void q.refetch()}>Try again</button></div>{children}</>;
 if(!q.data||!q.data.published)return <>{children}</>;
 return <article className="container-site max-w-4xl py-16">{secondary?<h2 className="headline text-3xl">{q.data.title}</h2>:<h1 className="headline text-4xl">{q.data.title}</h1>}{(q.data.sections||[]).map((section: ManagedSection, i: number)=><section key={i} className="my-10">{section.title&&<h2 className="mb-4 font-display text-2xl">{section.title}</h2>}{Array.isArray(section.content_json["paragraphs"])&&section.content_json["paragraphs"].filter((p: unknown):p is string=>typeof p==="string").map((p: string,j: number)=><p key={j} className="mb-4 whitespace-pre-line text-muted-foreground">{p}</p>)}{section.content_json["enquiry"]===true&&<Enquiry compact />}</section>)}</article>;
}

