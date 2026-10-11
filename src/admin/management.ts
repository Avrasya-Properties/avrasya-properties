import { websiteChanged } from "@/lib/website-sync";
import { supabase } from "@/lib/supabase";
import { fetchRows,refresh,rpc } from "./remote";
import type { Row } from "./mappers";
export type Field={key:string;label:string;type?:"text"|"number"|"date"|"datetime-local"|"boolean"|"json"|"textarea"|"paragraphs"|"steps"|"email";required?:boolean;options?:string[];ref?:string;hint?:string};
const f=(key:string,label:string,extra:Omit<Field,"key"|"label">={}):Field=>({key,label,...extra});
export const MODULES=[
 {name:"Developments",table:"projects",fields:[f("name","Development name",{required:true}),f("slug","Web address ending",{required:true}),f("district","District",{required:true}),f("city","City"),f("side","Side",{options:["Europe","Asia","unknown"]}),f("description","Description",{type:"textarea"})]},
 {name:"Registered apartments",table:"physical_units",fields:[f("project_id","Development",{ref:"projects"}),f("building_id","Building",{ref:"buildings"}),f("unit_number","Unit number",{required:true}),f("floor","Floor",{type:"number"}),f("layout_label","Layout"),f("gross_m2","Gross area",{type:"number"}),f("net_m2","Net area",{type:"number"}),f("status","Availability",{options:["Unknown","Available","Under Offer","Off Market"]}),f("tapu_status","Title deed status")]},
 {name:"Buildings",table:"buildings",fields:[f("project_id","Development",{required:true,ref:"projects"}),f("name","Building name",{required:true}),f("building_code","Block code"),f("total_floors","Floors",{type:"number"})]},
 {name:"Team accounts",table:"staff_profiles",admin:true,fields:[f("name","Name",{required:true}),f("email","Email",{required:true,type:"email"}),f("role","Role",{required:true,options:["admin","manager","agent","viewer"]}),f("is_active","Active",{type:"boolean"})]},
 {name:"Services",table:"services",fields:[f("slug","Web address ending",{required:true}),f("title","Title",{required:true}),f("category","Category"),f("description","Description",{required:true,type:"textarea"}),f("process_steps","Steps",{type:"steps",hint:"Write one step per line."}),f("sort_order","Order",{type:"number"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Questions and answers",table:"faqs",fields:[f("question","Question",{required:true}),f("answer","Answer",{required:true,type:"textarea"}),f("category","Category"),f("sort_order","Order",{type:"number"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Website pages",table:"content_pages",fields:[f("slug","Page address",{required:true,options:["about","services","citizenship","why-turkiye","investment-in-turkiye","investment-catalog"]}),f("title","Page title",{required:true}),f("meta_description","Search summary"),f("published_status","Website status",{required:true,options:["Draft","In Review","Published","Archived"]})]},
 {name:"Page sections",table:"content_sections",fields:[f("page_id","Content page",{required:true,ref:"content_pages"}),f("section_key","Section name",{required:true}),f("title","Section title"),f("content_json","Page text",{type:"paragraphs",hint:"Separate paragraphs with a blank line."}),f("_include_enquiry","Show a contact form",{type:"boolean"}),f("sort_order","Order",{type:"number"})]},
 {name:"Brochures",table:"catalog_documents",fields:[f("title","Title",{required:true}),f("edition","Edition"),f("storage_path","Download link",{required:true}),f("page_count","Pages",{type:"number"}),f("disclaimer","Disclaimer",{type:"textarea"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Leases",table:"leases",fields:[f("physical_unit_id","Apartment",{ref:"physical_units",required:true}),f("landlord_contact_id","Landlord",{ref:"contacts",required:true}),f("tenant_contact_id","Tenant",{ref:"contacts",required:true}),f("agent_id","Agent",{ref:"staff_profiles",required:true}),f("start_date","Start date",{type:"date",required:true}),f("end_date","End date",{type:"date",required:true}),f("rent_amount","Rent",{type:"number",required:true}),f("rent_currency","Currency",{options:["USD","EUR","TRY","GBP"]}),f("payment_frequency","Frequency",{options:["monthly","quarterly","annual"]}),f("payment_due_day","Due day",{type:"number"}),f("status","Status",{options:["draft","active","terminated","expired"]})]},
 {name:"Service providers",table:"vendors",fields:[f("company_name","Company",{required:true}),f("contact_name","Contact"),f("phone","Phone"),f("email","Email"),f("specialty","Specialty"),f("notes","Notes",{type:"textarea"}),f("is_active","Active",{type:"boolean"})]},
 {name:"Maintenance",table:"maintenance_tickets",fields:[f("physical_unit_id","Apartment",{ref:"physical_units"}),f("lease_id","Lease",{ref:"leases"}),f("vendor_id","Vendor",{ref:"vendors"}),f("title","Title",{required:true}),f("description","Description",{required:true}),f("priority","Priority",{options:["Low","Normal","High","Urgent"]}),f("status","Status",{options:["reported","assigned","in_progress","completed","cancelled"]}),f("estimated_cost","Estimate",{type:"number"}),f("actual_cost","Actual cost",{type:"number"}),f("currency","Currency",{options:["USD","EUR","TRY","GBP"]})]},
 {name:"Check source details",table:"extraction_candidates",fields:[f("review_status","Review status",{options:["pending","accepted","rejected","superseded"]}),f("review_notes","Review notes",{type:"textarea"})] ,existingOnly:true},
 {name:"Original documents",table:"source_files",readonly:true,fields:[]},
 {name:"Import history",table:"import_runs",readonly:true,fields:[]},
 {name:"Reservations",table:"reservations",readonly:true,fields:[]},
 {name:"Recorded payments",table:"recorded_payments",readonly:true,fields:[]},
 {name:"Change history",table:"audit_events",readonly:true,admin:true,fields:[]},
] as {name:string;table:string;fields:Field[];admin?:boolean;readonly?:boolean;existingOnly?:boolean}[];
export async function managedRows(table:string){if(!MODULES.some(m=>m.table===table)&&!["contacts","marketing_offers","developers","amenities"].includes(table))throw new Error("Unsupported management module");return fetchRows(table);}
export async function saveManaged(table:string,data:Row,original:Row|null){
 const module=MODULES.find(m=>m.table===table);if(!module||module.readonly)throw new Error("This module is read-only");
 const payload:Row={};
 for(const field of module.fields){if(!field.key.startsWith("_")&&field.key in data)payload[field.key]=data[field.key];if(field.required&&!String(data[field.key]??"").trim())throw new Error(field.label+" is required");}

 if(table==="content_sections"){
 const old=(original?.["content_json"]||{}) as Row;
 payload["content_json"]={...old,paragraphs:String(data["content_json"]||"").split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean),enquiry:data["_include_enquiry"]===true};
 }
 if(table==="services"&&typeof data["process_steps"]==="string"){const prior=editorRecord(original,table)["process_steps"];payload["process_steps"]=original&&prior===data["process_steps"]?original["process_steps"]:String(data["process_steps"]).split("\n").map(x=>x.trim()).filter(Boolean);}
 if(table==="staff_profiles"&&!original){
 const {data:response,error}=await supabase.functions.invoke("staff-accounts",{body:{name:data["name"],email:data["email"],role:data["role"],password:data["_password"]}});
 if(error){let detail="The account could not be created.";try{detail=(await (error as {context?:Response}).context?.json())?.error||detail;}catch{}throw new Error(detail);}
 if(response?.error)throw new Error(String(response.error));await refresh();return;
 }
 if(table==="staff_profiles"&&original)delete payload["id"];
 if(table==="physical_units"&&original&&["Reserved","Sold","Rented"].includes(String(original["status"])))throw new Error("Use the linked transaction to manage reserved or closed unit availability.");
 let query=original?supabase.from(table).update(payload).eq("id",original["id"]):supabase.from(table).insert(payload);
 if(original&&original["updated_at"])query=query.eq("updated_at",original["updated_at"]);
 const {error}=await query.select().single();if(error)throw error;await refresh();websiteChanged();
}
export async function linkUnit(offerId:string,unitId:string,version:number){await rpc("link_physical_unit",{p_offer:offerId,p_unit:unitId,p_version:version});await refresh();websiteChanged();

export async function expireReservations(){return rpc<number>("expire_reservations",{});}

export const ROLE_NAMES:Record<string,string>={admin:"Administrator",manager:"Office manager",agent:"Agent",viewer:"View only"};
export const PAGE_NAMES:Record<string,string>={about:"About us",services:"Services",citizenship:"Citizenship", "why-turkiye":"Why Türkiye","investment-in-turkiye":"Investing in Türkiye","investment-catalog":"Property brochure"};
export function recordName(row:Row){return String(row["marketing_title"]||row["name"]||row["title"]||row["question"]||row["company_name"]||row["file_name"]||row["unit_number"]||row["email"]||"Unnamed record");}
export function editorRecord(row:Row|null,table:string):Row{
 const result:Row=row?{...row}:{city:"Istanbul",side:"unknown",status:table==="maintenance_tickets"?"reported":table==="leases"?"draft":"Unknown",role:"agent",is_active:true,is_published:false,published_status:"Draft",sort_order:0};
 if(table==="content_sections"){const value=(row?.["content_json"]||{}) as Row;result["content_json"]=Array.isArray(value["paragraphs"])?value["paragraphs"].join("\n\n"):"";result["_include_enquiry"]=value["enquiry"]===true;}
 if(table==="services"){const steps=row?.["process_steps"];result["process_steps"]=Array.isArray(steps)?steps.map(s=>typeof s==="string"?s:recordName(s as Row)).join("\n"):"";}
 return result;
}
export async function deleteManaged(table:string,row:Row){
 if(!["faqs","services","content_sections","content_pages","catalog_documents"].includes(table))throw new Error("This record must be archived rather than deleted.");
 let query=supabase.from(table).delete().eq("id",row["id"]);if(row["updated_at"])query=query.eq("updated_at",row["updated_at"]);
 const {error}=await query.select().single();if(error)throw error;await refresh();
}
