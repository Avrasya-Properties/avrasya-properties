import { DEFAULT_SITE_SETTINGS, type DB, type SiteSettings } from "./demo";
export type Row = Record<string, unknown>;
export const TABLES = {properties:"marketing_offers",contacts:"contacts",leads:"leads",tasks:"tasks",viewings:"viewings",deals:"deals",inquiries:"enquiries"} as const;
export type Collection = keyof typeof TABLES;
export const FIELDS: Record<Collection, Record<string,string>> = {
 properties:{highlights:"highlights",galleryImages:"gallery_images",floorPlan:"floor_plan",id:"id",ref:"ref",slug:"slug",title:"marketing_title",district:"district",city:"city",type:"record_type",layout:"layout_label",bathrooms:"bathrooms",grossM2:"gross_m2",netM2:"net_m2",areaM2:"area_m2",amount:"amount",currency:"currency",mode:"mode",priceType:"price_type",priceBasis:"price_basis",availability:"availability",publication:"publication",agentId:"assigned_agent_id",cover:"cover_image_path",description:"description",sourceNote:"source_note",side:"side",tapuStatus:"tapu_status",updatedAt:"updated_at"},
 contacts:{id:"id",name:"name",kind:"kind",email:"email",phone:"phone",roles:"roles",language:"language",agentId:"assigned_agent_id",notes:"notes"},
 leads:{id:"id",contactId:"contact_id",source:"source",agentId:"assigned_agent_id",districts:"districts",layout:"layout",budgetMin:"budget_min",budgetMax:"budget_max",currency:"currency",stage:"stage",lossReason:"loss_reason",nextFollowUp:"next_follow_up",shortlist:"shortlist",dealId:"deal_id"},
 tasks:{id:"id",title:"title",assigneeId:"assignee_id",due:"due_date",priority:"priority",done:"is_done"},
 viewings:{id:"id",contactId:"contact_id",propertyId:"offer_id",agentId:"agent_id",start:"start_time",end:"end_time",status:"status",notes:"notes"},
 deals:{id:"id",title:"title",contactId:"contact_id",leadId:"lead_id",agentId:"assigned_agent_id",stage:"stage",amount:"total_amount",currency:"currency",expectedClose:"expected_close_date"},
 inquiries:{id:"id",name:"name",email:"email",phone:"phone",topic:"topic",budget:"budget",message:"message",source:"source",propertySlug:"property_slug",status:"status",createdAt:"created_at",notes:"notes",leadId:"lead_id",agentId:"assigned_agent_id"},
};
export const SETTINGS: Record<keyof SiteSettings,string> = {
websiteDesign:"website_design",
companyName:"company_name",registeredEntity:"registered_entity",taxOffice:"tax_office",licenseNo:"license_no",tagline:"tagline",email:"email",phone:"phone",whatsapp:"whatsapp",address:"address",advisoryHours:"advisory_hours",heroHeadline:"hero_headline",heroSubtitle:"hero_subtitle",eyebrowText:"eyebrow_text",cbiThresholdUsd:"cbi_threshold_usd",preloaderOpacity:"preloader_opacity",exchangeRateEur:"exchange_rate_eur",exchangeRateTry:"exchange_rate_try",exchangeRateGbp:"exchange_rate_gbp",enableFrankfurterSync:"enable_frankfurter_sync",announcementText:"announcement_text",announcementActive:"announcement_active",
districts:"districts",layouts:"layouts",budgetRanges:"budget_ranges"
};
export function decode<C extends Collection>(collection:C,row:Row): DB[C][number] {
 const value:Row={revision:row["updated_at"]};
 for(const [key,column] of Object.entries(FIELDS[collection])) {
  const v=row[column];
  if(v!==null && v!==undefined) value[key]=v;
  else if(["email","phone","notes","description","sourceNote","agentId","language","districts","layout","tapuStatus"].includes(key)) value[key]="";
  else if(["leadId","dealId","propertySlug"].includes(key)) continue;
  else value[key]=null;
 }
 if(collection==="properties"){const details=((row["source_record"] as Row|undefined)?.["details"]||{}) as Row;value["highlights"]=Array.isArray(details["highlights"])?details["highlights"]:[];value["galleryImages"]=Array.isArray(details["gallery_images"])?details["gallery_images"]:[];value["floorPlan"]=typeof details["floor_plan"]==="string"?details["floor_plan"]:null;value["type"]=String(row["record_type"]).replaceAll("_"," ");value["project"]=row["project_name"]||"";value["cbiEligible"]=row["cbi_verified"]===true&&row["cbi_eligible"]===true;}
 if(collection==="deals")value["propertyIds"]=row["property_ids"]||[];
 if(collection==="tasks"&&row["link_id"])value["link"]={kind:row["link_kind"],id:row["link_id"]};
 return value as DB[C][number];
}
export function encode(collection:Collection,item:Row):Row {
 const row:Row={};
 for(const [key,column] of Object.entries(FIELDS[collection])) if(key in item && !["updatedAt","createdAt"].includes(key)){
  const v=item[key];row[column]=key==="type"?String(v).replaceAll(" ","_"):["agentId","propertyId"].includes(key)&&v===""?null:v;
 }
 if(collection==="tasks"&&item["link"]){const link=item["link"] as {kind:string;id:string};row["link_kind"]=link.kind;row["link_id"]=link.id;}
 return row;
}
export function decodeSettings(row:Row):SiteSettings {
 const s = Object.fromEntries(Object.entries(SETTINGS).map(([key,column])=>[key,row[column]??DEFAULT_SITE_SETTINGS[key as keyof SiteSettings]])) as unknown as SiteSettings;
 const array = <T,>(value:unknown,fallback:T[]):T[] => {
  if(Array.isArray(value))return value as T[];
  if(typeof value==="string"){try{const parsed:unknown=JSON.parse(value);if(Array.isArray(parsed))return parsed as T[];}catch{}}
  return fallback;
 };
 s.districts=array(s.districts,DEFAULT_SITE_SETTINGS.districts);
 s.layouts=array(s.layouts,DEFAULT_SITE_SETTINGS.layouts);
 s.budgetRanges=array(s.budgetRanges,DEFAULT_SITE_SETTINGS.budgetRanges);
 s.websiteDesign=s.websiteDesign&&typeof s.websiteDesign==="object"&&!Array.isArray(s.websiteDesign)?s.websiteDesign:{};
 return s;
}
export function encodeSettings(settings:Partial<SiteSettings>):Row {return Object.fromEntries(Object.entries(settings).filter(([key])=>key in SETTINGS).map(([key,value])=>[SETTINGS[key as keyof SiteSettings],value]));}

