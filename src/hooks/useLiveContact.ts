import { useSiteSettings } from "@/admin/store";
import { CONTACT } from "@/data/properties";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
export type LiveContact={company:string;email:string;phone:string;phoneHref:string;whatsapp:string;address:string;tagline:string;advisoryHours:string;announcementActive?:boolean;announcementText?:string};
export function getLiveContact():LiveContact{return {...CONTACT,advisoryHours:DEFAULT_SITE_SETTINGS.advisoryHours};}
export function useLiveContact():LiveContact{const s=useSiteSettings();return {company:s.companyName,email:s.email,phone:s.phone,phoneHref:"tel:"+s.phone.replace(/\s/g,""),whatsapp:s.whatsapp,address:s.address,tagline:s.tagline,advisoryHours:s.advisoryHours,announcementActive:s.announcementActive,announcementText:s.announcementText};}

export function useWhatsAppLink() {
  const contact = useLiveContact();
  return (text: string) => buildWhatsAppLink(contact.whatsapp,text);
}
export function buildWhatsAppLink(base: string, text: string) {
  try {
    const raw = (base || "").trim() || "https://wa.me/905459248042";
    const normalized = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : /^\+?\d+$/.test(raw.replace(/\s+/g, ""))
        ? `https://wa.me/${raw.replace(/\D/g, "")}`
        : `https://${raw}`;
    const url = new URL(normalized);
    url.searchParams.set("text", text);
    return url.toString();
  } catch {
    return `https://wa.me/905459248042?text=${encodeURIComponent(text)}`;
  }
}


