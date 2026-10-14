import { websiteChanged } from "@/lib/website-sync";
import { supabase } from "@/lib/supabase";
import { fetchRows,refresh,rpc } from "./remote";
import type { Row } from "./mappers";
export type Field={key:string;label:string;type?:"text"|"number"|"date"|"datetime-local"|"boolean"|"json"|"textarea"|"paragraphs"|"steps"|"email"|"list";required?:boolean;options?:string[];ref?:string;hint?:string};
const f=(key:string,label:string,extra:Omit<Field,"key"|"label">={}):Field=>({key,label,...extra});
const currency=()=>f("currency","Currency",{required:true,options:["USD","EUR","TRY","GBP"]});
const money=(key:string,label:string,required=false)=>f(key,label,{type:"number",required});
export const REMOVABLE=["faqs","services","content_sections","content_pages","catalog_documents","offer_amenities","pricing_options","instalment_schedules","package_memberships","contact_shortlists"];
export const MODULES=[
 {name:"Developments",table:"projects",fields:[f("name","Development name",{required:true}),f("slug","Web address ending",{required:true}),f("district","District",{required:true}),f("city","City"),f("side","Side",{options:["Europe","Asia","unknown"]}),f("description","Description",{type:"textarea"}),f("developer_id","Developer",{ref:"developers"}),f("delivery_date","Delivery date",{type:"date"}),f("delivery_month_year","Delivery month or year"),f("tapu_status","Title deed status")]},
 {name:"Registered apartments",table:"physical_units",fields:[f("project_id","Development",{ref:"projects"}),f("building_id","Building",{ref:"buildings"}),f("unit_number","Unit number",{required:true}),f("floor","Floor",{type:"number"}),f("layout_label","Layout"),money("bedrooms","Bedrooms"),money("bathrooms","Bathrooms"),f("gross_m2","Gross area",{type:"number"}),f("net_m2","Net area",{type:"number"}),f("status","Availability",{options:["Unknown","Available","Under Offer","Off Market"]}),f("tapu_status","Title deed status"),f("orientation","Facing direction")]},
 {name:"Buildings",table:"buildings",fields:[f("project_id","Development",{required:true,ref:"projects"}),f("name","Building name",{required:true}),f("building_code","Block code"),f("total_floors","Floors",{type:"number"})]},
 {name:"Developers",table:"developers",fields:[f("name","Developer name",{required:true}),f("slug","Web address ending",{required:true})]},
 {name:"Property features",table:"amenities",fields:[f("name","Feature name",{required:true}),f("category","Category",{required:true})]},
 {name:"Listing features",table:"offer_amenities",fields:[f("offer_id","Property",{ref:"marketing_offers",required:true}),f("amenity_id","Feature",{ref:"amenities",required:true})]},
 {name:"Payment plans",table:"pricing_options",fields:[f("offer_id","Property",{ref:"marketing_offers",required:true}),f("option_name","Plan name",{required:true}),money("amount","Total price"),currency(),f("basis","Price basis",{required:true,options:["cash","installment_schedule","package","fixed","from","on_request","special_offer","advertised"]}),f("is_default","Main plan",{type:"boolean"}),money("down_payment_amount","Down payment"),money("down_payment_percent","Down payment (%)"),money("delivery_payment_amount","Payment at delivery"),money("delivery_payment_percent","Payment at delivery (%)"),money("installment_amount","Regular payment"),money("installment_count","Number of payments")]},
 {name:"Plan instalments",table:"instalment_schedules",fields:[f("pricing_option_id","Payment plan",{required:true,ref:"pricing_options"}),money("installment_no","Payment number",true),f("due_date","Due date",{type:"date"}),money("due_month_offset","Months after purchase"),money("amount","Amount",true),currency(),f("notes","Notes",{type:"textarea"})]},
 {name:"Package contents",table:"package_memberships",fields:[f("package_offer_id","Package listing",{required:true,ref:"marketing_offers"}),f("member_offer_id","Included listing",{ref:"marketing_offers"}),f("member_unit_id","Registered apartment",{ref:"physical_units"}),f("share_description","Description",{type:"textarea"})]},
 {name:"Team accounts",table:"staff_profiles",admin:true,fields:[f("name","Name",{required:true}),f("email","Email",{required:true,type:"email"}),f("role","Role",{required:true,options:["admin","manager","agent","viewer"]}),f("is_active","Active",{type:"boolean"})]},
 {name:"Services",table:"services",fields:[f("slug","Web address ending",{required:true}),f("title","Title",{required:true}),f("category","Category"),f("description","Description",{required:true,type:"textarea"}),f("process_steps","Steps",{type:"steps",hint:"Write one step per line."}),f("sort_order","Order",{type:"number"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Questions and answers",table:"faqs",fields:[f("question","Question",{required:true}),f("answer","Answer",{required:true,type:"textarea"}),f("category","Category"),f("sort_order","Order",{type:"number"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Website pages",table:"content_pages",fields:[f("slug","Page address",{required:true,options:["about","services","citizenship","why-turkiye","investment-in-turkiye","investment-catalog","privacy-policy","terms","cookie-policy","investment-disclaimer"]}),f("title","Page title",{required:true}),f("meta_description","Search summary"),f("published_status","Website status",{required:true,options:["Draft","In Review","Published","Archived"]})]},
 {name:"Page sections",table:"content_sections",fields:[f("page_id","Content page",{required:true,ref:"content_pages"}),f("section_key","Section name",{required:true}),f("title","Section title"),f("content_json","Page text",{type:"paragraphs",hint:"Separate paragraphs with a blank line."}),f("_include_enquiry","Show a contact form",{type:"boolean"}),f("sort_order","Order",{type:"number"})]},
 {name:"Brochures",table:"catalog_documents",fields:[f("title","Title",{required:true}),f("edition","Edition"),f("storage_path","Download link",{required:true}),f("page_count","Pages",{type:"number"}),f("disclaimer","Disclaimer",{type:"textarea"}),f("is_published","Published",{type:"boolean"})]},
 {name:"Buyer requirements",table:"buyer_requirements",fields:[f("contact_id","Buyer",{required:true,ref:"contacts"}),f("districts","Districts",{type:"list",hint:"One district per line."}),f("layouts","Layouts",{type:"list"}),f("property_types","Property types",{type:"list"}),money("budget_min","Minimum budget"),money("budget_max","Maximum budget"),currency(),f("cbi_required","Citizenship review requested",{type:"boolean"}),f("timeline","Purchase timeline"),f("notes","Notes",{type:"textarea"})]},
 {name:"Buyer shortlists",table:"contact_shortlists",fields:[f("contact_id","Buyer",{required:true,ref:"contacts"}),f("offer_id","Property",{required:true,ref:"marketing_offers"}),f("notes","Notes",{type:"textarea"})]},
 {name:"Deal documents",table:"document_checklists",fields:[f("deal_id","Deal",{required:true,ref:"deals"}),f("document_type","Document type",{required:true}),f("title","Document name",{required:true}),f("status","Status",{required:true,options:["pending","uploaded","verified","rejected"]}),f("storage_path","Document link"),f("notes","Notes",{type:"textarea"})]},
 {name:"Payment schedules",table:"payment_milestones",fields:[f("deal_id","Deal",{required:true,ref:"deals"}),f("milestone_name","Payment name",{required:true}),f("due_date","Due date",{required:true,type:"date"}),money("expected_amount","Expected amount",true),currency(),f("notes","Notes",{type:"textarea"})]},
 {name:"Agent commissions",table:"commission_allocations",fields:[f("deal_id","Deal",{required:true,ref:"deals"}),f("agent_id","Agent",{required:true,ref:"staff_profiles"}),f("role_in_deal","Role in this deal",{required:true}),money("percentage","Commission share (%)",true),money("calculated_amount","Commission amount",true),currency(),f("status","Status",{required:true,options:["pending","approved","paid"]}),f("notes","Notes",{type:"textarea"})]},
 {name:"Leases",table:"leases",fields:[f("physical_unit_id","Apartment",{ref:"physical_units",required:true}),f("offer_id","Rental listing",{ref:"marketing_offers"}),f("landlord_contact_id","Landlord",{ref:"contacts",required:true}),f("tenant_contact_id","Tenant",{ref:"contacts",required:true}),f("agent_id","Agent",{ref:"staff_profiles",required:true}),f("start_date","Start date",{type:"date",required:true}),f("end_date","End date",{type:"date",required:true}),f("rent_amount","Rent",{type:"number",required:true}),f("rent_currency","Rent currency",{required:true,options:["USD","EUR","TRY","GBP"]}),money("deposit_amount","Deposit",true),f("deposit_currency","Deposit currency",{required:true,options:["USD","EUR","TRY","GBP"]}),f("payment_frequency","Frequency",{options:["monthly","quarterly","annual"]}),f("payment_due_day","Due day",{type:"number"}),f("status","Status",{options:["draft","active","terminated","expired"]}),f("terms","Terms",{type:"textarea"})]},
 {name:"Rent charges",table:"rent_charges",fields:[f("lease_id","Lease",{required:true,ref:"leases"}),f("period_start","Period starts",{required:true,type:"date"}),f("period_end","Period ends",{required:true,type:"date"}),f("due_date","Due date",{required:true,type:"date"}),money("charge_amount","Amount",true),currency(),f("status","Status",{options:["pending","partial","paid","overdue"]})]},
 {name:"Rental deposits",table:"rental_deposits",fields:[f("lease_id","Lease",{required:true,ref:"leases"}),money("amount","Deposit amount",true),currency(),f("status","Status",{options:["held","returned","retained_for_repairs"]}),f("received_date","Received date",{type:"date",required:true}),f("return_date","Return date",{type:"date"}),f("notes","Notes",{type:"textarea"})]},
 {name:"Service providers",table:"vendors",fields:[f("company_name","Company",{required:true}),f("contact_name","Contact"),f("phone","Phone"),f("email","Email"),f("specialty","Specialty",{required:true}),f("notes","Notes",{type:"textarea"}),f("is_active","Active",{type:"boolean"})]},
 {name:"Maintenance",table:"maintenance_tickets",fields:[f("physical_unit_id","Apartment",{ref:"physical_units"}),f("lease_id","Lease",{ref:"leases"}),f("vendor_id","Vendor",{ref:"vendors"}),f("title","Title",{required:true}),f("description","Description",{required:true}),f("priority","Priority",{options:["Low","Normal","High","Urgent"]}),f("status","Status",{options:["reported","assigned","in_progress","completed","cancelled"]}),f("estimated_cost","Estimate",{type:"number"}),f("actual_cost","Actual cost",{type:"number"}),f("currency","Currency",{options:["USD","EUR","TRY","GBP"]})]},
 {name:"Check source details",table:"extraction_candidates",fields:[f("review_status","Review status",{options:["pending","accepted","rejected","superseded"]}),f("review_notes","Review notes",{type:"textarea"})] ,existingOnly:true},
 {name:"Original documents",table:"source_files",readonly:true,fields:[]},
 {name:"Import history",table:"import_runs",readonly:true,fields:[]},
 {name:"Reservations",table:"reservations",readonly:true,fields:[]},
 {name:"Recorded payments",table:"recorded_payments",appendOnly:true,fields:[f("deal_id","Deal",{required:true,ref:"deals"}),f("milestone_id","Payment schedule",{ref:"payment_milestones"}),f("payment_reference","Receipt reference",{required:true}),money("amount","Amount",true),currency(),f("payment_date","Received date",{required:true,type:"date"}),f("payment_method","Payment method",{required:true}),f("notes","Notes",{type:"textarea"})]},
 {name:"Price history",table:"price_history",readonly:true,fields:[]},
 {name:"Availability history",table:"availability_history",readonly:true,fields:[]},
 {name:"Publication history",table:"publication_history",readonly:true,fields:[]},
 {name:"Change history",table:"audit_events",readonly:true,admin:true,fields:[]},
] as {name:string;table:string;fields:Field[];admin?:boolean;readonly?:boolean;existingOnly?:boolean;appendOnly?:boolean}[];
export async function managedRows(table:string){if(!MODULES.some(m=>m.table===table)&&!["contacts","marketing_offers","deals"].includes(table))throw new Error("Unsupported management module");return fetchRows(table);}
export async function saveManaged(table:string,data:Row,original:Row|null){
 const module=MODULES.find(m=>m.table===table);if(!module||module.readonly)throw new Error("This module is read-only");
 const payload:Row={};
 for(const field of module.fields){if(!field.key.startsWith("_")&&field.key in data)payload[field.key]=data[field.key];if(field.required&&!String(data[field.key]??"").trim())throw new Error(field.label+" is required");}
 for(const field of module.fields)if(field.type==="number"&&payload[field.key]!=null){const n=Number(payload[field.key]);if(!Number.isFinite(n)||(field.key!=="floor"&&n<0))throw new Error(field.label+" needs a valid number");if(field.key.endsWith("percent")&&n>100)throw new Error(field.label+" must be between 0 and 100");}
 for(const field of module.fields)if(field.type==="list")payload[field.key]=String(data[field.key]||"").split("\n").map(x=>x.trim()).filter(Boolean);
 if(module.appendOnly){if(original)throw new Error("Receipts cannot be edited. Record a reversal to correct one.");await rpc("record_payment",{p_data:payload});await refresh();return;}
 if(table==="leases"&&String(payload["end_date"])<=String(payload["start_date"]))throw new Error("The lease end date must be after its start date.");
 if(table==="package_memberships"&&(!payload["member_offer_id"]&&!payload["member_unit_id"]||payload["package_offer_id"]===payload["member_offer_id"]))throw new Error("Choose a different included listing or a registered apartment.");

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
 if(table==="physical_units"&&original&&["Reserved","Sold","Rented"].includes(String(original["status"]))&&["status","unit_number","project_id","building_id"].some(key=>payload[key]!==original[key]))throw new Error("Use the linked transaction to change reserved or closed unit identity and availability.");
 let query=original?supabase.from(table).update(payload).eq("id",original["id"]):supabase.from(table).insert(payload);
 if(original&&table==="offer_amenities")query=supabase.from(table).update(payload).eq("offer_id",original["offer_id"]).eq("amenity_id",original["amenity_id"]);
 if(original&&original["updated_at"])query=query.eq("updated_at",original["updated_at"]);
 const {error}=await query.select().single();if(error)throw error;await refresh();websiteChanged();
}
export async function linkUnit(offerId:string,unitId:string,version:number){await rpc("link_physical_unit",{p_offer:offerId,p_unit:unitId,p_version:version});await refresh();websiteChanged();}

export async function expireReservations(){return rpc<number>("expire_reservations",{});}

export const ROLE_NAMES:Record<string,string>={admin:"Administrator",manager:"Office manager",agent:"Agent",viewer:"View only"};
export const PAGE_NAMES:Record<string,string>={about:"About us",services:"Services",citizenship:"Citizenship", "why-turkiye":"Why Türkiye","investment-in-turkiye":"Investing in Türkiye","investment-catalog":"Property brochure","privacy-policy":"Privacy policy",terms:"Terms and conditions","cookie-policy":"Cookie policy","investment-disclaimer":"Investment disclaimer"};
export function recordName(row:Row){return String(row["marketing_title"]||row["name"]||row["title"]||row["option_name"]||row["milestone_name"]||row["payment_reference"]||row["question"]||row["company_name"]||row["filename"]||row["unit_number"]||row["email"]||(row["start_date"]?"Lease from "+row["start_date"]:"Unnamed record"));}
export function editorRecord(row:Row|null,table:string):Row{
 const result:Row=row?{...row}:{city:"Istanbul",side:"unknown",status:table==="maintenance_tickets"?"reported":table==="leases"?"draft":"Unknown",role:"agent",is_active:true,is_published:false,published_status:"Draft",sort_order:0};
 if(table==="content_sections"){const value=(row?.["content_json"]||{}) as Row;result["content_json"]=Array.isArray(value["paragraphs"])?value["paragraphs"].join("\n\n"):"";result["_include_enquiry"]=value["enquiry"]===true;}
 if(table==="services"){const steps=row?.["process_steps"];result["process_steps"]=Array.isArray(steps)?steps.map(s=>typeof s==="string"?s:recordName(s as Row)).join("\n"):"";}
 for(const field of MODULES.find(m=>m.table===table)?.fields||[])if(field.type==="list")result[field.key]=Array.isArray(row?.[field.key])?(row![field.key] as string[]).join("\n"):"";
 if(!row)Object.assign(result,{currency:"USD",rent_currency:"USD",deposit_currency:"USD",deposit_amount:0,payment_due_day:1,payment_frequency:"monthly",category:"General",basis:"advertised",is_default:false,installment_no:1});
 if(!row&&table==="recorded_payments")result["payment_date"]=new Date().toISOString().slice(0,10);
 if(!row&&table==="document_checklists")result["status"]="pending";
 if(!row&&table==="rent_charges")result["status"]="pending";
 if(!row&&table==="rental_deposits")result["status"]="held";
 if(!row&&table==="commission_allocations")result["status"]="pending";
 return result;
}
export async function deleteManaged(table:string,row:Row){
 if(!REMOVABLE.includes(table))throw new Error("This record must be archived rather than deleted.");
 let query=supabase.from(table).delete().eq("id",row["id"]);if(row["updated_at"])query=query.eq("updated_at",row["updated_at"]);
 if(table==="offer_amenities")query=supabase.from(table).delete().eq("offer_id",row["offer_id"]).eq("amenity_id",row["amenity_id"]);
 const {error}=await query.select().single();if(error)throw error;await refresh();websiteChanged();
}
export async function reversePayment(row:Row,reason:string){await rpc("reverse_payment",{p_id:row["id"],p_reason:reason});await refresh();}
export async function uploadBrochure(file:File){
 if(file.type!=="application/pdf"||file.size>20*1024*1024||new TextDecoder().decode(await file.slice(0,5).arrayBuffer())!=="%PDF-")throw new Error("Use a PDF file under 20 MB.");
 const path="catalog/"+crypto.randomUUID()+".pdf";const {error}=await supabase.storage.from("public-marketing").upload(path,file,{upsert:false,contentType:"application/pdf"});if(error)throw error;return path;
}
