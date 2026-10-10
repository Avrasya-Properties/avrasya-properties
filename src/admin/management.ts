import { supabase } from "@/lib/supabase";
import { fetchRows,refresh,rpc } from "./remote";
import type { Row } from "./mappers";
export type Field={key:string;label:string;type?:"text"|"number"|"date"|"datetime-local"|"boolean"|"json";required?:boolean;options?:string[];ref?:string};
const f=(key:string,label:string,extra:Omit<Field,"key"|"label">={}):Field=>({key,label,...extra});
export const MODULES=[
 {name:"Developments",table:"projects",fields:[f("name","Development name",{required:true}),f("slug","URL slug",{required:true}),f("district","District",{required:true}),f("city","City"),f("side","Side",{options:["Europe","Asia","unknown"]}),f("description","Description")]},
 {name:"Physical units",table:"physical_units",fields:[f("project_id","Development",{ref:"projects"}),f("building_id","Building",{ref:"buildings"}),f("unit_number","Unit number",{required:true}),f("floor","Floor",{type:"number"}),f("layout_label","Layout"),f("gross_m2","Gross area",{type:"number"}),f("net_m2","Net area",{type:"number"}),f("status","Availability",{options:["Unknown","Available","Under Offer","Off Market"]}),f("tapu_status","Verified title status")]},
 {name:"Buildings",table:"buildings",fields:[f("project_id","Development",{required:true,ref:"projects"}),f("name","Building name",{required:true}),f("building_code","Block code"),f("total_floors","Floors",{type:"number"})]},
 {name:"Staff access",table:"staff_profiles",admin:true,fields:[f("id","Existing Supabase Auth user ID",{required:true}),f("name","Name",{required:true}),f("email","Email",{required:true}),f("role","Role",{required:true,options:["admin","manager","agent","viewer"]}),f("is_active","Active",{type:"boolean"})]},
 {name:"Services",table:"services",fields:[f("slug","URL slug",{required:true}),f("title","Title",{required:true}),f("category","Category"),f("description","Description",{required:true}),f("process_steps","Process steps (JSON)",{type:"json"}),f("sort_order","Order",{type:"number"}),f("is_published","Published",{type:"boolean"})]},
 {name:"FAQs",table:"faqs",fields:[f("question","Question",{required:true}),f("answer","Answer",{required:true}),f("category","Category"),f("sort_order","Order",{type:"number"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Content pages",table:"content_pages",fields:[f("slug","Page URL slug",{required:true}),f("title","Page title",{required:true}),f("meta_description","Meta description"),f("published_status","Publication",{options:["Draft","In Review","Published","Archived"]})]},
 {name:"Content sections",table:"content_sections",fields:[f("page_id","Content page",{required:true,ref:"content_pages"}),f("section_key","Section key",{required:true}),f("title","Section title"),f("content_json","Content (JSON)",{type:"json"}),f("sort_order","Order",{type:"number"})]},
 {name:"Catalogue documents",table:"catalog_documents",fields:[f("title","Title",{required:true}),f("edition","Edition"),f("storage_path","Public marketing Storage path or /downloads/ path",{required:true}),f("page_count","Pages",{type:"number"}),f("disclaimer","Disclaimer"),f("is_published","Published",{type:"boolean"})]},
 {name:"Leases",table:"leases",fields:[f("physical_unit_id","Physical unit",{ref:"physical_units",required:true}),f("landlord_contact_id","Landlord",{ref:"contacts",required:true}),f("tenant_contact_id","Tenant",{ref:"contacts",required:true}),f("agent_id","Agent",{ref:"staff_profiles",required:true}),f("start_date","Start date",{type:"date",required:true}),f("end_date","End date",{type:"date",required:true}),f("rent_amount","Rent",{type:"number",required:true}),f("rent_currency","Currency",{options:["USD","EUR","TRY","GBP"]}),f("payment_frequency","Frequency",{options:["monthly","quarterly","annual"]}),f("payment_due_day","Due day",{type:"number"}),f("status","Status",{options:["draft","active","terminated","expired"]})]},
 {name:"Vendors",table:"vendors",fields:[f("company_name","Company",{required:true}),f("contact_name","Contact"),f("phone","Phone"),f("email","Email"),f("specialty","Specialty"),f("notes","Notes"),f("is_active","Active",{type:"boolean"})]},
 {name:"Maintenance",table:"maintenance_tickets",fields:[f("physical_unit_id","Physical unit",{ref:"physical_units"}),f("lease_id","Lease",{ref:"leases"}),f("vendor_id","Vendor",{ref:"vendors"}),f("title","Title",{required:true}),f("description","Description",{required:true}),f("priority","Priority",{options:["Low","Normal","High","Urgent"]}),f("status","Status",{options:["reported","assigned","in_progress","completed","cancelled"]}),f("estimated_cost","Estimate",{type:"number"}),f("actual_cost","Actual cost",{type:"number"}),f("currency","Currency",{options:["USD","EUR","TRY","GBP"]})]},
 {name:"Source review",table:"extraction_candidates",fields:[f("review_status","Review status",{options:["pending","accepted","rejected","superseded"]}),f("review_notes","Review notes")] ,existingOnly:true},
 {name:"Source files",table:"source_files",readonly:true,fields:[]},
 {name:"Import runs",table:"import_runs",readonly:true,fields:[]},
 {name:"Reservations",table:"reservations",readonly:true,fields:[]},
 {name:"Recorded payments",table:"recorded_payments",readonly:true,fields:[]},
 {name:"Audit trail",table:"audit_events",readonly:true,admin:true,fields:[]},
] as {name:string;table:string;fields:Field[];admin?:boolean;readonly?:boolean;existingOnly?:boolean}[];
export async function managedRows(table:string){if(!MODULES.some(m=>m.table===table)&&!["contacts"].includes(table))throw new Error("Unsupported management module");return fetchRows(table);}
export async function saveManaged(table:string,data:Row,original:Row|null){
 const module=MODULES.find(m=>m.table===table);if(!module||module.readonly)throw new Error("This module is read-only");
 const payload:Row={};
 for(const field of module.fields){if(field.key in data)payload[field.key]=data[field.key];if(field.required&&!String(data[field.key]??"").trim())throw new Error(field.label+" is required");}
 if(table==="staff_profiles"&&original)delete payload["id"];
 if(table==="physical_units"&&original&&["Reserved","Sold","Rented"].includes(String(original["status"])))throw new Error("Use the linked transaction to manage reserved or closed unit availability.");
 let query=original?supabase.from(table).update(payload).eq("id",original["id"]):supabase.from(table).insert(payload);
 if(original&&original["updated_at"])query=query.eq("updated_at",original["updated_at"]);
 const {error}=await query.select().single();if(error)throw error;await refresh();
}
export async function linkUnit(offerId:string,unitId:string,version:number){await rpc("link_physical_unit",{p_offer:offerId,p_unit:unitId,p_version:version});await refresh();}
