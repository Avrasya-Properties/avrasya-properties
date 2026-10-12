import type {Property} from "./demo";
import type {Row} from "./mappers";
import type {PropertyRecord,Price,RecordType,Area} from "@/data/properties";
// Use the same editable fields and source price rules as save_offer's public snapshot.
export function listingPreview(p:Property,raw?:Row):PropertyRecord {
 const source=(raw?.["source_record"]||{}) as Row;
 const details=(source["details"]||{}) as Row;
 const oldPrice=(source["price"]||{}) as Price;
 const basis=p.priceBasis||"advertised";
 const sourcePrice=!raw||basis===raw["price_basis"]?oldPrice:{} as Price;
 const areas:Area[]=[];
 if(p.grossM2!==null)areas.push({value_m2:p.grossM2,basis:"gross"});
 if(p.netM2!==null)areas.push({value_m2:p.netM2,basis:"net"});
 if(p.areaM2!==null)areas.push({value_m2:p.areaM2,basis:"unspecified"});
 return {id:p.id,ref:p.ref,slug:p.slug,marketing_title:p.title,city:p.city,location_label:p.district||null,side:p.side||"unknown",record_type:p.type.replaceAll(" ","_") as RecordType,mode:p.mode,layout_label:p.layout||null,bathrooms:p.bathrooms,tapu_status:p.tapuStatus||null,source_note:p.sourceNote||null,
 price:{...sourcePrice,amount:p.amount,currency:p.currency,basis:p.priceType==="on-request"?"on_request":p.priceType==="from"&&basis==="advertised"?"from":basis,status:"staff-published"},areas,source_ids:Array.isArray(source["source_ids"])?source["source_ids"] as string[]:[],cover:p.cover,availability:p.availability,availability_verified:p.availability==="Available",
 details:{...details,project:p.project,note:p.description,cbi_verified:p.cbiEligible===true,claims_requiring_confirmation:Array.isArray(raw?.["claims_requiring_confirmation"])?raw!["claims_requiring_confirmation"] as string[]:[],gallery_images:p.galleryImages||[],floor_plan:p.floorPlan||null,highlights:p.highlights||[]}};
}
