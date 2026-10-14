import {describe,it,expect,vi} from "vitest";
vi.mock("@/admin/store",()=>({useSiteSettings:()=>({})}));
import {buildWhatsAppLink} from "@/hooks/useLiveContact";
describe("managed contact links",()=>{
 it("keeps the configured phone when WhatsApp already has a query",()=>{const link=new URL(buildWhatsAppLink("https://api.whatsapp.com/send?phone=905459248042","Please show me property A & B"));expect(link.searchParams.get("phone")).toBe("905459248042");expect(link.searchParams.get("text")).toBe("Please show me property A & B");});
 it("replaces an old message instead of appending a second query",()=>{const link=new URL(buildWhatsAppLink("https://wa.me/905459248042?text=old","New message"));expect(link.searchParams.getAll("text")).toEqual(["New message"]);expect(link.pathname).toBe("/905459248042");});
});
