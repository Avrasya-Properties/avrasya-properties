import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DEMO_MODE,publicSupabase } from "@/lib/supabase";
import { properties as source,type PropertyRecord } from "./properties";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { decodeSettings,type Row } from "@/admin/mappers";
const record=z.object({slug:z.string(),marketing_title:z.string(),city:z.string(),location_label:z.string().nullable(),side:z.enum(["Europe","Asia","unknown"]),record_type:z.enum(["unit_offer","unit_type","package","project","ambiguous_offer"]),layout_label:z.string().nullable(),price:z.object({currency:z.enum(["USD","TRY","EUR","GBP"]).nullable(),amount:z.number().nullable(),basis:z.string(),status:z.string()}).passthrough(),areas:z.array(z.object({value_m2:z.number(),basis:z.enum(["gross","net","unspecified"])}).passthrough()),source_ids:z.array(z.string()),availability_verified:z.boolean(),details:z.record(z.unknown())}).passthrough();
export async function loadCatalogue():Promise<PropertyRecord[]>{
 if(DEMO_MODE){
   if(typeof window!=="undefined"){
     try{
       const raw=localStorage.getItem("avrasya-admin-db-v4");
       if(raw){
         const parsed=JSON.parse(raw);
         if(Array.isArray(parsed?.properties)){
           const demoProps=parsed.properties as {slug:string;publication?:string;title?:string;district?:string;layout?:string;amount?:number|null;currency?:string|null}[];
           const map=new Map(demoProps.map(p=>[p.slug,p]));
           return source.filter(s=>{
             const dp=map.get(s.slug);
             return dp?dp.publication==="Published":true;
           }).map(s=>{
             const dp=map.get(s.slug);
             if(!dp)return s;
             return {
               ...s,
               marketing_title:dp.title||s.marketing_title,
               location_label:dp.district||s.location_label,
               layout_label:dp.layout||s.layout_label,
               price:{
                 ...s.price,
                 amount:dp.amount!==undefined?dp.amount:s.price.amount,
                 currency:(dp.currency as any)||s.price.currency,
               },
             };
           });
         }
       }
     }catch{}
   }
   return source;
 }
 const {data,error}=await publicSupabase.rpc("published_catalogue");
 if(error)throw new Error("The property catalogue is unavailable. Please contact our advisory team.");
 return z.array(record).parse(data) as PropertyRecord[];
}
export function useCatalogue(){const q=useQuery({queryKey:["published-catalogue"],queryFn:loadCatalogue,staleTime:60000,refetchOnMount:false,refetchOnWindowFocus:false,refetchInterval:60000});return {...q,properties:q.data||[]};}
export async function loadPublicSettings(){
 if(DEMO_MODE){
   if(typeof window!=="undefined"){
     try{
       const raw=localStorage.getItem("avrasya-admin-db-v4");
       if(raw){
         const parsed=JSON.parse(raw);
         if(parsed?.siteSettings)return parsed.siteSettings;
       }
     }catch{}
   }
   return DEFAULT_SITE_SETTINGS;
 }
 const {data,error}=await publicSupabase.from("site_settings").select("*").eq("singleton_key","default").single();
 if(error)throw error;return decodeSettings(data as Row);
}
export function usePublicSettings(){
 const q=useQuery({queryKey:["site-settings"],queryFn:loadPublicSettings,staleTime:60000,refetchInterval:60000});
 return {...q,settings:q.data||DEFAULT_SITE_SETTINGS};
}
export async function resolveRedirect(slug:string):Promise<string|null>{const {data,error}=await publicSupabase.rpc("published_redirect",{p_slug:slug});if(error)throw error;return data as string|null;}

export function useManagedPage(slug:string){return useQuery({queryKey:["website-page",slug],queryFn:async()=>{
  if(DEMO_MODE){
    if(typeof window!=="undefined"){
      try{
        const raw=localStorage.getItem("avrasya_admin_manage_demo_v2");
        if(raw){
          const parsed=JSON.parse(raw);
          const page=(parsed?.content_pages||[]).find((p:any)=>p.slug===slug);
          if(page){
            const sections=(parsed?.content_sections||[]).filter((s:any)=>s.page_id===page.id);
            return {
              published:page.published_status==="Published",
              title:page.title,
              meta_description:page.meta_description,
              sections:sections.map((s:any)=>({title:s.title,content_json:s.content_json})),
            };
          }
        }
      }catch{}
    }
    return null;
  }
  const {data,error}=await publicSupabase.rpc("website_page",{p_slug:slug});if(error)throw error;return data as {published:boolean;title?:string;meta_description?:string;sections?:{title:string|null;content_json:Record<string,unknown>}[]}|null;
},staleTime:15000,refetchInterval:30000});}

export function usePublishedDocuments(){return useQuery({queryKey:["catalogue-documents"],queryFn:async()=>{
  if(DEMO_MODE){
    if(typeof window!=="undefined"){
      try{
        const raw=localStorage.getItem("avrasya_admin_manage_demo_v2");
        if(raw){
          const parsed=JSON.parse(raw);
          if(Array.isArray(parsed?.catalog_documents))return parsed.catalog_documents.filter((d:any)=>d.is_published!==false);
        }
      }catch{}
    }
    return [{title:"Avrasya Istanbul Investment & Citizenship Catalog (2026 Edition)",storage_path:"/documents/avrasya-investment-catalog-2026.pdf",disclaimer:"Confidential institutional memorandum."}];
  }
  const {data,error}=await publicSupabase.from("catalog_documents").select("title,storage_path,disclaimer").eq("is_published",true).order("created_at",{ascending:false});if(error)throw error;return data as {title:string;storage_path:string;disclaimer:string|null}[];
},staleTime:15000,refetchInterval:30000});}

export function useServices(){return useQuery({queryKey:["services"],queryFn:async()=>{
  if(DEMO_MODE){
    if(typeof window!=="undefined"){
      try{
        const raw=localStorage.getItem("avrasya_admin_manage_demo_v2");
        if(raw){
          const parsed=JSON.parse(raw);
          if(Array.isArray(parsed?.services))return parsed.services.filter((s:any)=>s.is_published!==false);
        }
      }catch{}
    }
    return [
      {id:"srv-1",title:"Luxury Property Acquisition",category:"Advisory",description:"Bespoke acquisition advisory for prime Istanbul residential portfolios.",process_steps:["Investor Discovery Consultation","Curated Portfolio Shortlist","On-site Private Inspections","Price & Commercial Term Negotiation"]},
      {id:"srv-2",title:"Turkish Citizenship by Investment ($400,000)",category:"Legal & Statutory",description:"Full legal guidance and turnkey application processing for qualifying Istanbul property under statutory regulations.",process_steps:["Statutory Due Diligence & Valuation","Escrow & Title Transfer","Conformity Certificate Issuance","Passport & National ID Delivery"]},
      {id:"srv-3",title:"Independent Legal Due Diligence",category:"Legal & Statutory",description:"Comprehensive title deed (Tapu), zoning clearance, and lien-free audits conducted exclusively by independent Bar-certified Turkish attorneys.",process_steps:["Cadastral Register Verification","Municipal Zoning Audit","Encumbrance & Mortgage Check","Independent Legal Opinion Report"]}
    ];
  }
  const {data,error}=await publicSupabase.from("services").select("id,title,category,description,process_steps").eq("is_published",true).order("sort_order");if(error)throw error;return data as {id:string;title:string;category:string|null;description:string;process_steps:unknown[]}[];
},staleTime:15000,refetchInterval:30000});}

export function useFaqs(){return useQuery({queryKey:["faqs"],queryFn:async()=>{
  if(DEMO_MODE){
    if(typeof window!=="undefined"){
      try{
        const raw=localStorage.getItem("avrasya_admin_manage_demo_v2");
        if(raw){
          const parsed=JSON.parse(raw);
          if(Array.isArray(parsed?.faqs))return parsed.faqs.filter((f:any)=>f.is_published!==false);
        }
      }catch{}
    }
    return [
      {id:"faq-1",question:"What is the statutory threshold for Turkish Citizenship by Investment?",answer:"The statutory threshold under Article 20 of the Regulation on Implementation of the Turkish Citizenship Law is $400,000 USD (or equivalent foreign currency converted via DAB). The property must carry a 3-year no-sale annotation on the Tapu.",category:"Citizenship"},
      {id:"faq-2",question:"Can foreign nationals purchase freehold real estate in Türkiye?",answer:"Yes. Property acquisitions in Türkiye are 100% freehold (Mülkiyet) and protected by constitutional property rights. Foreign buyers receive an official government title deed (Tapu Senedi).",category:"Ownership & Legal"},
      {id:"faq-3",question:"What are the standard closing costs when acquiring property in Istanbul?",answer:"Standard statutory closing costs comprise: 4% Title Deed (Tapu) conveyance duty, official valuation report, revolving capital fund fee, and notary fees.",category:"Financial"}
    ];
  }
  const {data,error}=await publicSupabase.from("faqs").select("id,question,answer,category").eq("is_published",true).order("sort_order");if(error)throw error;return data as {id:string;question:string;answer:string;category:string}[];
},staleTime:15000,refetchInterval:30000});}
