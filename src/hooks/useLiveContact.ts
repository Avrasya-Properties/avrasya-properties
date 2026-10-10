import { useState, useEffect } from "react";
import { CONTACT } from "@/data/properties";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/admin/store";

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
          email: (s.email && s.email !== "info.avrasyaproperties@gmail.com") ? s.email : CONTACT.email,
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
          email: (s.email && s.email !== "info.avrasyaproperties@gmail.com") ? s.email : CONTACT.email,
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
