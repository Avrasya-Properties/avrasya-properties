import { useSiteSettings } from "@/admin/store";
import { CONTACT } from "@/data/properties";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
export type LiveContact={company:string;email:string;phone:string;phoneHref:string;whatsapp:string;address:string;tagline:string;advisoryHours:string;announcementActive?:boolean;announcementText?:string};
export function getLiveContact():LiveContact{return {...CONTACT,advisoryHours:DEFAULT_SITE_SETTINGS.advisoryHours};}
export function useLiveContact():LiveContact{const s=useSiteSettings();return {company:s.companyName,email:s.email,phone:s.phone,phoneHref:"tel:"+s.phone.replace(/\s/g,""),whatsapp:s.whatsapp,address:s.address,tagline:s.tagline,advisoryHours:s.advisoryHours,announcementActive:s.announcementActive,announcementText:s.announcementText};}

<<<<<<< HEAD
const SKEY = "avrasya-admin-db-v4";

export type LiveContact = {
  company: string;
  email: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  address: string;
  tagline: string;
  advisoryHours: string;
  announcementActive?: boolean;
  announcementText?: string;
};

export function getLiveContact(): LiveContact {
  if (typeof window === "undefined") {
    return {
      ...CONTACT,
      advisoryHours: DEFAULT_SITE_SETTINGS.advisoryHours,
      announcementActive: DEFAULT_SITE_SETTINGS.announcementActive,
      announcementText: DEFAULT_SITE_SETTINGS.announcementText,
    };
  }
  try {
    const raw = localStorage.getItem(SKEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.siteSettings) {
        const s: SiteSettings = parsed.siteSettings;
        return {
          company: s.registeredEntity || CONTACT.company,
          email:
            s.email && s.email !== "info.avrasyaproperties@gmail.com" ? s.email : CONTACT.email,
          phone: s.phone || CONTACT.phone,
          phoneHref: `tel:${(s.phone || CONTACT.phone).replace(/\s/g, "")}`,
          whatsapp: s.whatsapp || CONTACT.whatsapp,
          address: s.address || CONTACT.address,
          tagline: s.tagline || CONTACT.tagline,
          advisoryHours: s.advisoryHours || DEFAULT_SITE_SETTINGS.advisoryHours,
          announcementActive: s.announcementActive ?? false,
          announcementText: s.announcementText || "",
        };
      }
    }
  } catch {
    /* fallback */
  }
  return {
    ...CONTACT,
    advisoryHours: DEFAULT_SITE_SETTINGS.advisoryHours,
    announcementActive: DEFAULT_SITE_SETTINGS.announcementActive,
    announcementText: DEFAULT_SITE_SETTINGS.announcementText,
  };
}

export function useLiveContact(): LiveContact {
  const [contact, setContact] = useState<LiveContact>(getLiveContact);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        const s = customEvent.detail;
        setContact({
          company: s.registeredEntity || CONTACT.company,
          email:
            s.email && s.email !== "info.avrasyaproperties@gmail.com" ? s.email : CONTACT.email,
          phone: s.phone || CONTACT.phone,
          phoneHref: `tel:${(s.phone || CONTACT.phone).replace(/\s/g, "")}`,
          whatsapp: s.whatsapp || CONTACT.whatsapp,
          address: s.address || CONTACT.address,
          tagline: s.tagline || CONTACT.tagline,
          advisoryHours: s.advisoryHours || DEFAULT_SITE_SETTINGS.advisoryHours,
          announcementActive: s.announcementActive ?? false,
          announcementText: s.announcementText || "",
        });
      } else {
        setContact(getLiveContact());
      }
    };

    window.addEventListener("site-settings-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("site-settings-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return contact;
}
=======
export function useWhatsAppLink(){const contact=useLiveContact();return (text:string)=>contact.whatsapp+"?text="+encodeURIComponent(text);}
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f
