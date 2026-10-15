import {render,fireEvent,screen,waitFor} from "@testing-library/react";
import {describe,it,expect,vi,beforeEach} from "vitest";
const {invoke}=vi.hoisted(()=>({invoke:vi.fn()}));
vi.mock("@/lib/supabase",()=>({DEMO_MODE:false,publicSupabase:{functions:{invoke}}}));
vi.mock("@/data/live",()=>({useServices:()=>({data:[]}),useCatalogue:()=>({properties:[]})}));
vi.mock("@/hooks/useLiveContact",()=>({useLiveContact:()=>({whatsapp:"https://wa.me/905551234567",email:"test@example.test",phone:"+90 555 1234567"})}));
import {Enquiry} from "@/components/site/Enquiry";
beforeEach(()=>invoke.mockReset());
describe("real enquiry form contract",()=>{
 it("submits consent and a stable retry key from a compact property form",async()=>{
  invoke.mockResolvedValueOnce({data:null,error:{context:new Response(JSON.stringify({error:"Temporary failure"}))}}).mockResolvedValue({data:{receipt:"AVR-ACTUAL-SERVER-RECEIPT"},error:null});
  const {container}=render(<Enquiry compact propertySlug="real-property" defaultTopic="Real property"/>);
  fireEvent.change(screen.getByLabelText(/full name/i),{target:{value:"Test buyer"}});
  fireEvent.change(screen.getByLabelText(/email/i),{target:{value:"test@example.test"}});
  fireEvent.change(screen.getByLabelText(/message/i),{target:{value:"Please arrange a viewing"}});
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.submit(container.querySelector("form")!);
  await screen.findByText("Temporary failure");
  expect(container.textContent).not.toContain("AVR-ACTUAL-SERVER-RECEIPT");
  const first=invoke.mock.calls[0]![1].body;
  expect(first).toMatchObject({propertySlug:"real-property",consent:true,website:""});
  expect(first.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  fireEvent.submit(container.querySelector("form")!);
  await waitFor(()=>expect(invoke).toHaveBeenCalledTimes(2));
  expect(invoke.mock.calls[1]![1].body.idempotencyKey).toBe(first.idempotencyKey);
  await screen.findByText(/AVR-ACTUAL-SERVER-RECEIPT/);
 });
});
