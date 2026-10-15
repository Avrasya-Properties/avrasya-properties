import { websiteChanged } from "@/lib/website-sync";
import { DEMO_MODE, supabase } from "@/lib/supabase";
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
] as {name:string;table:string;fields:Field[];admin?:boolean;readonly?:boolean;existingOnly?:boolean}[];

const DEMO_STORE_KEY = "avrasya_admin_manage_demo_v2";

const DEFAULT_DEMO_DATA: Record<string, Row[]> = {
  projects: [
    { id: "proj-1", name: "RAMS Beyond Istanbul", slug: "rams-beyond", district: "Maslak", city: "Istanbul", side: "Europe", description: "Ultra-luxury architectural icon in Maslak financial hub." },
    { id: "proj-2", name: "The Ritz-Carlton Residences", slug: "ritz-carlton-residences", district: "Şişli", city: "Istanbul", side: "Europe", description: "Exclusive branded residences with panoramic Bosphorus views." },
    { id: "proj-3", name: "Mandarin Oriental Bosphorus", slug: "mandarin-oriental", district: "Beşiktaş", city: "Istanbul", side: "Europe", description: "Private waterfront luxury living on the European Bosphorus shoreline." },
    { id: "proj-4", name: "Dua Terrace Topkapı", slug: "dua-terrace", district: "Topkapı", city: "Istanbul", side: "Europe", description: "Family-oriented luxury development next to historic peninsula." },
  ],
  physical_units: [
    { id: "unit-1", project_id: "proj-1", building_id: "bld-1", unit_number: "2604", floor: 26, layout_label: "3+1", gross_m2: 215, net_m2: 172, status: "Available", tapu_status: "Kat Mülkiyeti (Ready)" },
    { id: "unit-2", project_id: "proj-2", building_id: "bld-2", unit_number: "1402", floor: 14, layout_label: "2+1", gross_m2: 155, net_m2: 124, status: "Available", tapu_status: "Kat Mülkiyeti (Ready)" },
  ],
  buildings: [
    { id: "bld-1", project_id: "proj-1", name: "Tower A (Skyline Residences)", building_code: "A1", total_floors: 42 },
    { id: "bld-2", project_id: "proj-2", name: "Residential Tower", building_code: "RT", total_floors: 28 },
  ],
  staff_profiles: [
    { id: "u1", name: "Selin Arda", email: "admin@avrasya.test", role: "admin", is_active: true, created_at: "2024-01-01T00:00:00Z" },
    { id: "u2", name: "Murat Kaya", email: "manager@avrasya.test", role: "manager", is_active: true, created_at: "2024-01-01T00:00:00Z" },
    { id: "u3", name: "Elif Demir", email: "agent@avrasya.test", role: "agent", is_active: true, created_at: "2024-01-01T00:00:00Z" },
    { id: "u4", name: "Can Yılmaz", email: "viewer@avrasya.test", role: "viewer", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  ],
  services: [
    { id: "srv-1", slug: "property-acquisition", title: "Luxury Property Acquisition", category: "Advisory", description: "Bespoke acquisition advisory for prime Istanbul residential portfolios.", process_steps: ["Investor Discovery Consultation", "Curated Portfolio Shortlist", "On-site Private Inspections", "Price & Commercial Term Negotiation"], sort_order: 1, is_published: true },
    { id: "srv-2", slug: "citizenship-by-investment", title: "Turkish Citizenship by Investment ($400,000)", category: "Legal & Statutory", description: "Full legal guidance and turnkey application processing for qualifying Istanbul property under statutory regulations.", process_steps: ["Statutory Due Diligence & Valuation", "Escrow & Title Transfer", "Conformity Certificate Issuance", "Passport & National ID Delivery"], sort_order: 2, is_published: true },
    { id: "srv-3", slug: "independent-legal-due-diligence", title: "Independent Legal Due Diligence", category: "Legal & Statutory", description: "Comprehensive title deed (Tapu), zoning clearance, and lien-free audits conducted exclusively by independent Bar-certified Turkish attorneys.", process_steps: ["Cadastral Register Verification", "Municipal Zoning Audit", "Encumbrance & Mortgage Check", "Independent Legal Opinion Report"], sort_order: 3, is_published: true },
    { id: "srv-4", slug: "foreign-buyer-tax-vat-exemption", title: "Foreign Buyer VAT Exemption (Law No. 3065)", category: "Financial Advisory", description: "Statutory application and qualification for 0% VAT exemption on initial new-build property purchases in Türkiye.", process_steps: ["Eligibility Audit", "Statutory Document Certification", "Tax Office Filing", "Exemption Certificate Delivery"], sort_order: 4, is_published: true },
  ],
  faqs: [
    { id: "faq-1", question: "What is the statutory threshold for Turkish Citizenship by Investment?", answer: "The statutory threshold under Article 20 of the Regulation on Implementation of the Turkish Citizenship Law is $400,000 USD (or equivalent foreign currency converted via DAB). The property must carry a 3-year no-sale annotation on the Tapu.", category: "Citizenship", sort_order: 1, is_published: true },
    { id: "faq-2", question: "Can foreign nationals purchase freehold real estate in Türkiye?", answer: "Yes. Property acquisitions in Türkiye are 100% freehold (Mülkiyet) and protected by constitutional property rights. Foreign buyers receive an official government title deed (Tapu Senedi).", category: "Ownership & Legal", sort_order: 2, is_published: true },
    { id: "faq-3", question: "What are the standard closing costs when acquiring property in Istanbul?", answer: "Standard statutory closing costs comprise: 4% Title Deed (Tapu) conveyance duty (conventionally split 2% buyer / 2% seller or as agreed in contract), official valuation report (approx. $300-$500), revolving capital fund fee (approx. $150-$250), and sworn translation / notary fees.", category: "Financial", sort_order: 3, is_published: true },
  ],
  content_pages: [
    { id: "cp-1", slug: "about", title: "About Avrasya Properties", meta_description: "Headquartered on Istanbul's historic Asian shoreline, Avrasya Properties provides trusted, transparent property guidance for international home buyers and investors.", published_status: "Published" },
    { id: "cp-2", slug: "services", title: "Property Advisory & Buying Services", meta_description: "Ten end-to-end property advisory services covering personalized search, Turkish citizenship, independent legal checks, interior setup, and ongoing management.", published_status: "Published" },
    { id: "cp-3", slug: "citizenship", title: "Turkish Citizenship by Investment ($400,000)", meta_description: "Clear, comprehensive guide and interactive cost calculator for obtaining Turkish citizenship through qualifying Istanbul real estate.", published_status: "Published" },
    { id: "cp-4", slug: "why-turkiye", title: "Why Istanbul Real Estate", meta_description: "Neighborhood guides, lifestyle insights, and freehold property rights in Istanbul for international home buyers and families.", published_status: "Published" },
    { id: "cp-5", slug: "investment-in-turkiye", title: "Buying Property in Türkiye", meta_description: "Clear, comprehensive guide to buying property in Istanbul: step-by-step process, transparent taxes, rental strategies, and essential buyer protections.", published_status: "Published" },
    { id: "cp-6", slug: "investment-catalog", title: "Avrasya Investment Catalog", meta_description: "Official 17-page Avrasya Properties Group Investment Catalog. Detailed six-phase acquisition pathway, verified 10-year financial projections, and Turkish Citizenship by Investment framework.", published_status: "Published" },
  ],
  content_sections: [
    { id: "cs-1", page_id: "cp-1", section_key: "hero", title: "Our Heritage & Commitment", content_json: { paragraphs: ["Avrasya Properties was founded to provide transparent, institutional real estate consultancy for international investors navigating Istanbul's dynamic property landscape.", "Operating from our flagship office in Üsküdar, we bridge European institutional rigor with deep local cadastral expertise."], enquiry: false }, sort_order: 1 },
    { id: "cs-2", page_id: "cp-3", section_key: "overview", title: "Direct Citizenship Advisory", content_json: { paragraphs: ["Our dedicated legal desk conducts exhaustive title verification and valuation matching to guarantee your acquisition satisfies all statutory criteria under the Presidency of Migration Management."], enquiry: true }, sort_order: 1 },
  ],
  catalog_documents: [
    { id: "cd-1", title: "Avrasya Istanbul Investment & Citizenship Catalog (2026 Edition)", edition: "2026 Institutional", storage_path: "/documents/avrasya-investment-catalog-2026.pdf", page_count: 17, disclaimer: "Confidential institutional memorandum. Subject to legal review and availability confirmation.", is_published: true },
  ],
  leases: [],
  vendors: [
    { id: "vnd-1", company_name: "Bosphorus Legal Counsel", contact_name: "Av. Kerem Soylu", phone: "+90 212 555 1234", email: "kerem@bosphoruslegal.test", specialty: "Real Estate & Citizenship Law", notes: "Bar-certified legal partner for title deed due diligence.", is_active: true },
    { id: "vnd-2", company_name: "Denge Değerleme SPK", contact_name: "Murat Özkan", phone: "+90 216 444 5678", email: "info@dengedegerleme.test", specialty: "SPK Certified Property Valuation", notes: "Official appraisal reports for citizenship conformity certificates.", is_active: true },
  ],
  maintenance_tickets: [],
  extraction_candidates: [],
  source_files: [],
  import_runs: [],
  reservations: [],
  recorded_payments: [],
  audit_events: [
    { id: "ae-1", actor_id: "u1", table_name: "site_settings", action: "SEO & Search settings initialized", created_at: new Date().toISOString() },
  ],
};

function getDemoStore(): Record<string, Row[]> {
  if (typeof window === "undefined") return DEFAULT_DEMO_DATA;
  try {
    const raw = localStorage.getItem(DEMO_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_DEMO_DATA;
}

function saveDemoStore(store: Record<string, Row[]>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
    } catch {}
  }
}

export async function managedRows(table:string):Promise<Row[]>{
 if(DEMO_MODE){
   const store = getDemoStore();
   return store[table] || [];
 }
 if(!MODULES.some(m=>m.table===table)&&!["contacts","marketing_offers","developers","amenities"].includes(table))throw new Error("Unsupported management module");
 return fetchRows(table);
}

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

 if(DEMO_MODE){
   const store = getDemoStore();
   const rows = [...(store[table] || [])];
   if(original){
     const idx = rows.findIndex(r => r["id"] === original["id"]);
     if(idx !== -1){
       rows[idx] = { ...original, ...payload, updated_at: new Date().toISOString() };
     }
   } else {
     const id = `${table.slice(0, 3)}-${crypto.randomUUID()}`;
     rows.unshift({ id, ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
   }
   store[table] = rows;
   saveDemoStore(store);
   websiteChanged();
   return;
 }

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
