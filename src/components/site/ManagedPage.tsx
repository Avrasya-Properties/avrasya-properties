import { useEffect, type ReactNode } from "react";
import { DEMO_MODE } from "@/lib/supabase";
import { useManagedPage } from "@/data/live";
import { Enquiry } from "./Enquiry";
export function ManagedPage({slug,children}:{slug:string;children:ReactNode}){
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
 if(q.isPending)return <div role="status" className="container-site py-16">Loading…</div>;
 // Static source pages remain the default until an authored CMS page is supplied.
 if(q.isError||!q.data)return <>{children}</>;
 if(!q.data.published)return <section className="container-site py-20"><h1 className="headline text-3xl">This page is currently unavailable.</h1><a href="/contact" className="btn btn-primary mt-6">Contact our team</a></section>;
 if(!q.data.sections?.length)return <>{children}</>;
 return <article className="container-site max-w-4xl py-16"><h1 className="headline text-4xl">{q.data.title}</h1>{q.data.sections.map((section,i)=><section key={i} className="my-10">{section.title&&<h2 className="mb-4 font-display text-2xl">{section.title}</h2>}{Array.isArray(section.content_json["paragraphs"])&&section.content_json["paragraphs"].filter((p):p is string=>typeof p==="string").map((p,j)=><p key={j} className="mb-4 whitespace-pre-line text-muted-foreground">{p}</p>)}{section.content_json["enquiry"]===true&&<Enquiry compact />}</section>)}</article>;
}
