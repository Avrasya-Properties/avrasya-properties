import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DEMO_MODE,publicSupabase } from "@/lib/supabase";
import { properties as source,type PropertyRecord } from "./properties";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { decodeSettings,type Row } from "@/admin/mappers";
const record=z.object({slug:z.string(),marketing_title:z.string(),city:z.string(),location_label:z.string().nullable(),side:z.enum(["Europe","Asia","unknown"]),record_type:z.enum(["unit_offer","unit_type","package","project","ambiguous_offer"]),layout_label:z.string().nullable(),price:z.object({currency:z.enum(["USD","TRY","EUR","GBP"]).nullable(),amount:z.number().nullable(),basis:z.string(),status:z.string()}).passthrough(),areas:z.array(z.object({value_m2:z.number(),basis:z.enum(["gross","net","unspecified"])}).passthrough()),source_ids:z.array(z.string()),availability_verified:z.boolean(),details:z.record(z.unknown())}).passthrough();
export async function loadCatalogue():Promise<PropertyRecord[]>{
 if(DEMO_MODE)return source;
 const {data,error}=await publicSupabase.rpc("published_catalogue");
 if(error)throw new Error("The property catalogue is unavailable. Please contact our advisory team.");
 return z.array(record).parse(data) as PropertyRecord[];
}
export function useCatalogue(){const q=useQuery({queryKey:["published-catalogue"],queryFn:loadCatalogue,staleTime:15000,refetchInterval:30000});return {...q,properties:q.data||[]};}
export function usePublicSettings(){
 const q=useQuery({queryKey:["site-settings"],queryFn:async()=>{const {data,error}=await publicSupabase.from("site_settings").select("*").eq("singleton_key","default").single();if(error)throw error;return decodeSettings(data as Row);},enabled:!DEMO_MODE,staleTime:15000,refetchInterval:30000});
 return {...q,settings:q.data||DEFAULT_SITE_SETTINGS};
}
export async function resolveRedirect(slug:string):Promise<string|null>{const {data,error}=await publicSupabase.rpc("published_redirect",{p_slug:slug});if(error)throw error;return data as string|null;}

export function useManagedPage(slug:string){return useQuery({queryKey:["website-page",slug],enabled:!DEMO_MODE,queryFn:async()=>{const {data,error}=await publicSupabase.rpc("website_page",{p_slug:slug});if(error)throw error;return data as {published:boolean;title?:string;meta_description?:string;sections?:{title:string|null;content_json:Record<string,unknown>}[]}|null;},staleTime:15000,refetchInterval:30000});}
export function usePublishedDocuments(){return useQuery({queryKey:["catalogue-documents"],queryFn:async()=>{const {data,error}=await publicSupabase.from("catalog_documents").select("title,storage_path,disclaimer").eq("is_published",true).order("created_at",{ascending:false});if(error)throw error;return data as {title:string;storage_path:string;disclaimer:string|null}[];},enabled:!DEMO_MODE,staleTime:15000,refetchInterval:30000});}

export function useServices(){return useQuery({queryKey:["services"],enabled:!DEMO_MODE,queryFn:async()=>{const {data,error}=await publicSupabase.from("services").select("id,title,category,description,process_steps").eq("is_published",true).order("sort_order");if(error)throw error;return data as {id:string;title:string;category:string|null;description:string;process_steps:unknown[]}[];},staleTime:15000,refetchInterval:30000});}
export function useFaqs(){return useQuery({queryKey:["faqs"],enabled:!DEMO_MODE,queryFn:async()=>{const {data,error}=await publicSupabase.from("faqs").select("id,question,answer,category").eq("is_published",true).order("sort_order");if(error)throw error;return data as {id:string;question:string;answer:string;category:string}[];},staleTime:15000,refetchInterval:30000});}
