import { publicSupabase } from "./supabase";
export function publicDocumentUrl(path:string):string|undefined {
 if(/^https:\/\/[^\s]+$/.test(path)||/^\/downloads\/[^\s]+$/.test(path))return path;
 if(!path||path.startsWith("/")||path.includes(":")||path.includes("..")||/\s/.test(path))return undefined;
 return publicSupabase.storage.from("public-marketing").getPublicUrl(path).data.publicUrl;
}
