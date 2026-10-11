import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { decode,decodeSettings,encode,encodeSettings,TABLES,type Collection,type Row } from "./mappers";
import { DEFAULT_SITE_SETTINGS,type DB,type User,type SiteSettings,type Property,type Lead,type Deal,type Inquiry,type Activity } from "./demo";
import { validateSettings,requireText } from "./domain.js";
const empty:DB={properties:[],contacts:[],leads:[],tasks:[],viewings:[],deals:[],inquiries:[],siteSettings:DEFAULT_SITE_SETTINGS,activity:[],readNotes:[]};
let snapshot:DB=empty;
let user:User|null=null;
export const staff:User[]=[];
let status={loading:true,saving:0,error:""};
const listeners=new Set<()=>void>();
let generation=0;let started=false;
const rows=new Map<string,Row>();
const notify=()=>listeners.forEach(fn=>fn());
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
function message(error:unknown){return error instanceof Error?error.message:String((error as {message?:string})?.message||"The request failed");}
export async function fetchRows(table:string):Promise<Row[]> {
 const output:Row[]=[];
 for(let offset=0;;offset+=1000){const {data,error}=await supabase.from(table).select("*").order(table==="notification_receipts"?"notification_key":table==="offer_amenities"?"offer_id":"id").range(offset,offset+999);if(error)throw error;const batch=data as Row[];output.push(...batch);if(batch.length<1000)break;if(offset>100000)throw new Error("Use filtered exports for large tables.");}
 return output;
}
export async function refresh(){
 const ticket=++generation;
 try{
 const {data:{session},error:sessionError}=await supabase.auth.getSession();if(sessionError)throw sessionError;
 if(!session){user=null;snapshot=empty;staff.splice(0);rows.clear();status={...status,loading:false,error:""};notify();return;}
 const {data:{user:verified},error:authError}=await supabase.auth.getUser();if(authError||!verified)throw authError||new Error("Session expired");
 const {data:profile,error:profileError}=await supabase.from("staff_profiles").select("id,name,email,role,is_active").eq("id",verified.id).single();
 if(profileError||!profile?.is_active)throw new Error("This account has no active staff access. Ask the owner to add your staff profile.");
 const names=[...Object.values(TABLES),"site_settings","activities","deal_selected_units","staff_profiles","projects","notification_receipts"];
 const result=await Promise.all(names.map(fetchRows));
 if(ticket!==generation)return;
 const tables=Object.fromEntries(names.map((name,index)=>[name,result[index]!]));
 rows.clear();for(const [table,list]of Object.entries(tables))for(const r of list)rows.set(table+":"+String(r["id"]),r);
 const projects=new Map(tables["projects"]!.map(r=>[r["id"],r["name"]]));
 const selected=tables["deal_selected_units"]!;
 const next={...empty} as DB;
 for(const [collection,table]of Object.entries(TABLES) as [Collection,string][]){
 const records=tables[table]!.map(r=>decode(collection,{...r,project_name:projects.get(r["project_id"]),property_ids:selected.filter(x=>x["deal_id"]===r["id"]).map(x=>x["offer_id"])}));
 (next[collection] as unknown[])=records;
 }
 next.siteSettings=decodeSettings(tables["site_settings"]![0]!);
 next.activity=tables["activities"]!.map(r=>({id:String(r["id"]),at:String(r["created_at"]),userId:String(r["user_id"]||""),kind:String(r["kind"]),text:String(r["text"]),...(r["ref_id"]?{ref:{kind:String(r["ref_kind"]),id:String(r["ref_id"])}}:{})}));
 next.readNotes=tables["notification_receipts"]!.map(r=>String(r["notification_key"]));
 staff.splice(0,staff.length,...tables["staff_profiles"]!.filter(r=>r["is_active"]).map(r=>({id:String(r["id"]),name:String(r["name"]),email:String(r["email"]),role:r["role"] as User["role"]})));
 user={id:profile.id,name:profile.name,email:profile.email,role:profile.role};snapshot=next;status={...status,loading:false,error:""};notify();
 }catch(error){if(ticket!==generation)return;user=null;snapshot=empty;rows.clear();staff.splice(0);status={...status,loading:false,error:message(error)};notify();}
}
function start(){if(started||typeof window==="undefined")return;started=true;void refresh();supabase.auth.onAuthStateChange(()=>{queueMicrotask(()=>void refresh());});window.addEventListener("focus",()=>void refresh());setInterval(()=>{if(user&&!status.saving)void refresh();},30000);}
export function useRemoteDB(){useEffect(start,[]);return useSyncExternalStore(subscribe,()=>snapshot,()=>empty);}
export function getRemoteSession(){return user;}
export function useRemoteSession(){useEffect(start,[]);return useSyncExternalStore(subscribe,()=>user,()=>null);}
export function useStatus(){useEffect(start,[]);return useSyncExternalStore(subscribe,()=>status,()=>status);}
export async function signIn(email:string,password:string){const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;await refresh();if(!user)throw new Error(status.error||"Staff access is not configured.");return user;}
export async function signOut(){++generation;user=null;snapshot=empty;rows.clear();staff.splice(0);status={loading:false,saving:0,error:""};notify();const {error}=await supabase.auth.signOut();if(error)throw error;}
export async function resetPassword(email:string){requireText(email,"Email",254);const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+"/admin/recover"});if(error)throw error;}
export async function changePassword(password:string){if(password.length<12)throw new Error("Use at least 12 characters.");const {error}=await supabase.auth.updateUser({password});if(error)throw error;}
let queue:Promise<unknown>=Promise.resolve();
async function write<T>(operation:()=>Promise<T>):Promise<T>{
 const run=async()=>{status={...status,saving:status.saving+1};notify();try{const result=await operation();await refresh();return result;}finally{status={...status,saving:Math.max(0,status.saving-1)};notify();}};
 const result=queue.then(run,run);queue=result.catch(()=>undefined);return result;
}
export async function rpc<T>(name:string,args:Row):Promise<T>{const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data as T;}
export function upsert<T extends {id:string}>(collection:Collection,item:Row & {id?:string}):Promise<T>{
 return write(async()=>{
 const original=item.id?rows.get(TABLES[collection]+":"+item.id):undefined;
 if(original && item["revision"] && item["revision"]!==original["updated_at"])throw new Error("This record changed while you were editing. Refresh before saving.");
 if(original && collection==="properties" && item["updatedAt"] && item["updatedAt"]!==original["updated_at"])throw new Error("This offer changed while you were editing. Refresh before saving.");
 if(item.id&&!original)throw new Error("Record missing or inaccessible. Refresh before saving.");
 const merged:Row={...(item.id?(snapshot[collection] as {id:string}[]).find(x=>x.id===item.id):{}),...item};
 const payload=encode(collection,merged);
 let result:Row;
 if(collection==="properties"){
 const projectName=String(merged["project"]||"");const project=Array.from(rows.values()).find(r=>r["name"]===projectName&&r["slug"]&&r["district"]);
 if(projectName&&!project)throw new Error("Create or choose a registered development in Management before assigning its name.");
 payload["project_id"]=project?.["id"]||null;
 if(typeof payload["cover_image_path"]==="string"&&payload["cover_image_path"].startsWith("data:"))throw new Error("Upload the image to Storage before saving.");
 result=await rpc<Row>("save_offer",{p_data:payload,p_version:original?.["version"]||null});
 }else if(collection==="deals"){
 await rpc("save_deal",{p_data:payload,p_version:original?.["version"],p_offers:merged["propertyIds"]||[]});
 result={...original,...payload,property_ids:merged["propertyIds"]||[]};
 }else{
 delete payload["id"];
 if(collection==="inquiries")for(const key of Object.keys(payload))if(!["status","notes","assigned_agent_id"].includes(key))delete payload[key];
 let query=original?supabase.from(TABLES[collection]).update(payload).eq("id",item.id!).eq("updated_at",original["updated_at"]):supabase.from(TABLES[collection]).insert(payload);
 const {data,error}=await query.select().single();if(error)throw error;result=data as Row;
 }
 return decode(collection,result) as unknown as T;
 });
}
export function settingsRevision(){return String(Array.from(rows.entries()).find(([key])=>key.startsWith("site_settings:"))?.[1]?.["updated_at"]||"");}
export function updateSettings(patch:Partial<SiteSettings>,expectedRevision?:string){return write(async()=>{const next=validateSettings({...snapshot.siteSettings,...patch});const original=Array.from(rows.entries()).find(([key])=>key.startsWith("site_settings:"))?.[1];if(!original)throw new Error("Settings unavailable");if(expectedRevision&&expectedRevision!==original["updated_at"])throw new Error("Website settings changed while you were editing. Reload this page before saving.");const {error}=await supabase.from("site_settings").update({...encodeSettings(next),updated_by:user!.id}).eq("id",original["id"]).eq("updated_at",original["updated_at"]).select().single();if(error)throw error;window.dispatchEvent(new Event("site-settings-updated"));});}
export function bulkPublication(ids:string[],publication:Property["publication"]){return write(()=>rpc("bulk_publication",{p_ids:ids,p_publication:publication}));}
export function convertInquiry(id:string):Promise<Lead>{return write(async()=>{const leadId=await rpc<string>("convert_enquiry",{p_id:id});const {data,error}=await supabase.from("leads").select().eq("id",leadId).single();if(error)throw error;return decode("leads",data as Row);});}
export function convertLead(id:string):Promise<Deal>{return write(async()=>{const dealId=await rpc<string>("convert_lead",{p_id:id});const {data,error}=await supabase.from("deals").select().eq("id",dealId).single();if(error)throw error;return decode("deals",data as Row);});}
export function setDealStage(id:string,stage:Deal["stage"]){return write(()=>rpc("transition_deal",{p_id:id,p_stage:stage,p_version:rows.get("deals:"+id)?.["version"]}));}
export function addActivity(kind:string,text:string,ref?:Activity["ref"]){return write(async()=>{requireText(text,"Activity text",4000);const {error}=await supabase.from("activities").insert({user_id:user!.id,kind,text,ref_kind:ref?.kind||null,ref_id:ref?.id||null});if(error)throw error;});}
export function markRead(ids:string[],read:boolean){return write(async()=>{const operation=read?supabase.from("notification_receipts").upsert(ids.map(id=>({user_id:user!.id,notification_key:id})),{onConflict:"user_id,notification_key"}):supabase.from("notification_receipts").delete().eq("user_id",user!.id).in("notification_key",ids);const {error}=await operation;if(error)throw error;});}
export function createInquiry(item:Omit<Inquiry,"id"|"createdAt"|"status">){return write(async()=>{const id=await rpc<string>("staff_create_enquiry",{p_data:encode("inquiries",item)});const {data,error}=await supabase.from("enquiries").select().eq("id",id).single();if(error)throw error;return decode("inquiries",data as Row);});}
export async function exportBackup(){if(user?.role!=="admin")throw new Error("Administrator access required.");const tables=await Promise.all(["staff_profiles","developers","projects","buildings","physical_units","marketing_offers","package_memberships","amenities","offer_amenities","pricing_options","instalment_schedules","price_history","availability_history","publication_history","property_slug_redirects","contacts","buyer_requirements","contact_shortlists","enquiries","leads","tasks","viewings","activities","notes","contact_merges","deals","deal_selected_units","offer_revisions","reservations","document_checklists","payment_milestones","recorded_payments","commission_allocations","leases","rent_charges","rent_payment_allocations","rental_deposits","vendors","maintenance_tickets","site_settings","content_pages","content_sections","services","faqs","catalog_documents","audit_events","notifications","storage_files","source_files","extraction_candidates","import_runs","notification_receipts"].map(fetchRows));return JSON.stringify({schemaVersion:2,exportedAt:new Date().toISOString(),data:Object.fromEntries(["staff_profiles","developers","projects","buildings","physical_units","marketing_offers","package_memberships","amenities","offer_amenities","pricing_options","instalment_schedules","price_history","availability_history","publication_history","property_slug_redirects","contacts","buyer_requirements","contact_shortlists","enquiries","leads","tasks","viewings","activities","notes","contact_merges","deals","deal_selected_units","offer_revisions","reservations","document_checklists","payment_milestones","recorded_payments","commission_allocations","leases","rent_charges","rent_payment_allocations","rental_deposits","vendors","maintenance_tickets","site_settings","content_pages","content_sections","services","faqs","catalog_documents","audit_events","notifications","storage_files","source_files","extraction_candidates","import_runs","notification_receipts"].map((name,i)=>[name,tables[i]])),externalFilesIncluded:false},null,2);}
export async function uploadImage(file:File){if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error("Use a JPEG, PNG or WebP under 5 MB.");const path="offers/"+crypto.randomUUID()+"."+file.type.split("/")[1];const {error}=await supabase.storage.from("public-marketing").upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;return supabase.storage.from("public-marketing").getPublicUrl(path).data.publicUrl;}
export function rawRecord(collection:Collection,id:string){return rows.get(TABLES[collection]+":"+id);}
