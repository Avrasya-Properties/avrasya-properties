import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {isDemoMode} from "@/lib/app-mode";
const {invoke}=vi.hoisted(()=>({invoke:vi.fn()}));
vi.mock("@/lib/supabase",()=>({DEMO_MODE:false,publicSupabase:{functions:{invoke}}}));
import {submitPublicEnquiry} from "@/lib/public-enquiry";
import {watchWebsiteChanges,websiteChanged} from "@/lib/website-sync";
const input={name:"Test buyer",email:"test@example.test",phone:"",topic:"Property",message:"Please contact me",consent:true,idempotencyKey:"00000000-0000-4000-8000-000000004001",propertySlug:"test-property",website:""};
beforeEach(()=>invoke.mockReset());
afterEach(()=>vi.useRealTimers());
describe("production connection regressions",()=>{
 it.each(["production","development","staging","preview"])('ignores the demo flag in a %s build',MODE=>{expect(isDemoMode({MODE,VITE_ENABLE_ADMIN_DEMO:"true"})).toBe(false);});
 it("allows only an explicit isolated demo/test build",()=>{expect(isDemoMode({MODE:"demo",VITE_ENABLE_ADMIN_DEMO:"true"})).toBe(true);expect(isDemoMode({MODE:"test",VITE_ENABLE_ADMIN_DEMO:"true"})).toBe(true);expect(isDemoMode({MODE:"demo",VITE_ENABLE_ADMIN_DEMO:"false"})).toBe(false);});
 it("sends the server's full enquiry contract and accepts only its real receipt",async()=>{invoke.mockResolvedValue({data:{receipt:"AVR-SERVER-RECEIPT"},error:null});expect(await submitPublicEnquiry(input)).toEqual({receipt:"AVR-SERVER-RECEIPT"});expect(invoke).toHaveBeenCalledWith("submit-enquiry",expect.objectContaining({body:expect.objectContaining({consent:true,idempotencyKey:input.idempotencyKey,propertySlug:"test-property",website:""}),timeout:expect.any(Number)}));});
 it("rejects server failure without generating a demo receipt",async()=>{invoke.mockResolvedValue({data:null,error:{context:new Response(JSON.stringify({error:"Submission is not configured"}))}});await expect(submitPublicEnquiry(input)).rejects.toThrow("Submission is not configured");});
 it("rejects an empty success response",async()=>{invoke.mockResolvedValue({data:{},error:null});await expect(submitPublicEnquiry(input)).rejects.toThrow("could not confirm");});
 it("does not submit without consent",async()=>{await expect(submitPublicEnquiry({...input,consent:false})).rejects.toThrow("consent");expect(invoke).not.toHaveBeenCalled();});
 it("refetches on another device's revision and stops when unmounted",async()=>{
  vi.useFakeTimers();Object.defineProperty(document,"visibilityState",{configurable:true,value:"visible"});
  const read=vi.fn().mockResolvedValue("first"),refresh=vi.fn();
  const stop=watchWebsiteChanges(refresh,{poll:true,readRevision:read});
  await vi.advanceTimersByTimeAsync(60);expect(refresh).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(5000);expect(refresh).toHaveBeenCalledTimes(1);
  read.mockResolvedValue("published-from-another-device");await vi.advanceTimersByTimeAsync(5000);expect(refresh).toHaveBeenCalledTimes(2);
  stop();const count=read.mock.calls.length;await vi.advanceTimersByTimeAsync(10000);window.dispatchEvent(new Event("focus"));await vi.advanceTimersByTimeAsync(60);expect(read).toHaveBeenCalledTimes(count);expect(refresh).toHaveBeenCalledTimes(2);
 });
 it("coalesces browser-only change signals",async()=>{vi.useFakeTimers();const refresh=vi.fn();const stop=watchWebsiteChanges(refresh,{poll:false});websiteChanged();websiteChanged();await vi.advanceTimersByTimeAsync(60);expect(refresh).toHaveBeenCalledTimes(1);stop();});
});
