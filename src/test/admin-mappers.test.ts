import { describe,expect,it } from "vitest";
import { decode,encode,decodeSettings,encodeSettings } from "@/admin/mappers";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
describe("persistent admin mappings",()=>{
 it("round-trips approved gallery and floor-plan fields",()=>{const p=decode("properties",{id:"p",source_record:{details:{gallery_images:["https://approved.example/image.jpg"],floor_plan:"https://approved.example/plan.jpg"}}});expect(p.galleryImages).toEqual(["https://approved.example/image.jpg"]);expect(p.floorPlan).toBe("https://approved.example/plan.jpg");expect(encode("properties",{galleryImages:p.galleryImages,floorPlan:p.floorPlan})).toEqual({gallery_images:p.galleryImages,floor_plan:p.floorPlan});});

 it("keeps unknown fields null and verified eligibility separate from price",()=>{const p=decode("properties",{id:"p",record_type:"unit_type",marketing_title:"Offer",amount:500000,currency:"USD",cbi_eligible:true,cbi_verified:false});expect(p.bathrooms).toBeNull();expect(p.type).toBe("unit type");expect(p.cbiEligible).toBe(false);});
 it("maps slugs, staff IDs and nullable metadata to schema fields",()=>{expect(encode("properties",{slug:"test",type:"ambiguous offer",agentId:"",grossM2:null,updatedAt:"stale"})).toEqual({slug:"test",record_type:"ambiguous_offer",assigned_agent_id:null,gross_m2:null});});
 it("preserves native deal currency and selected offer identities",()=>{const d=decode("deals",{id:"d",total_amount:1000000,currency:"TRY",property_ids:["actual-id"]});expect(d.currency).toBe("TRY");expect(d.amount).toBe(1000000);expect(d.propertyIds).toEqual(["actual-id"]);});
 it("maps viewing offer references and instants without timezone arithmetic",()=>{expect(encode("viewings",{propertyId:"uuid",start:"2026-12-20T10:00:00+03:00",end:"2026-12-20T11:00:00+03:00"})).toEqual({offer_id:"uuid",start_time:"2026-12-20T10:00:00+03:00",end_time:"2026-12-20T11:00:00+03:00"});});
 it("retains revision information for stale-editor detection",()=>{const c=decode("contacts",{id:"c",name:"Buyer",updated_at:"version-a"});expect((c as unknown as Record<string,unknown>)["revision"]).toBe("version-a");});
 it("round-trips every website setting without renaming legal identity",()=>{expect(decodeSettings(encodeSettings(DEFAULT_SITE_SETTINGS))).toEqual(DEFAULT_SITE_SETTINGS);});
 it("excludes mutation of settings audit columns",()=>{expect(encodeSettings({companyName:"New"})).toEqual({company_name:"New"});});
 it("loads legacy settings without losing defaults or throwing on malformed arrays",()=>{const settings=decodeSettings({company_name:"Actual company",districts:"invalid JSON"});expect(settings.companyName).toBe("Actual company");expect(settings.districts).toEqual(DEFAULT_SITE_SETTINGS.districts);expect(settings.email).toBe(DEFAULT_SITE_SETTINGS.email);});
 it("preserves intentionally empty managed filters",()=>{expect(decodeSettings({districts:[],layouts:[],budget_ranges:[]}).budgetRanges).toEqual([]);});
});
