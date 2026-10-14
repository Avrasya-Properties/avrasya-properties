import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";
const origin="http://127.0.0.1:8081";
const api="http://127.0.0.1:3001";
const secret="isolated-browser-test-secret-at-least-32-characters";
const ids={admin:1,manager:2,agent:3,other:4,viewer:5};
const uuid=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0");
const jwt=role=>{const head=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url");const body=Buffer.from(JSON.stringify({sub:uuid(ids[role]),role:"authenticated",session_id:uuid(100+ids[role]),aud:"authenticated",exp:Math.floor(Date.now()/1000)+3600})).toString("base64url");return head+"."+body+"."+createHmac("sha256",secret).update(head+"."+body).digest("base64url");};
const actor=role=>({id:uuid(ids[role]),email:role+"@example.test",aud:"authenticated",role:"authenticated",app_metadata:{provider:"email"},user_metadata:{},created_at:"2026-10-10T00:00:00Z"});
const adminToken=jwt("admin");
async function rest(path,method="GET",data,token=adminToken){const response=await fetch(api+path,{method,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json",Prefer:"return=representation"},...(data?{body:JSON.stringify(data)}:{})});const text=await response.text();if(!response.ok)throw new Error(response.status+" "+text);return text?JSON.parse(text):null;}
// A stray demo flag must not disconnect a normal application build from its database.
const child=spawn("bun",["run","dev","--host","127.0.0.1","--port","8081"],{stdio:["ignore","pipe","pipe"],env:{...process.env,VITE_ENABLE_ADMIN_DEMO:"true",VITE_SUPABASE_URL:"http://127.0.0.1:8082"}});
let serverOutput="";for(const stream of [child.stdout,child.stderr])stream.on("data",c=>serverOutput=(serverOutput+c).slice(-4000));
let browser,page;const pageErrors=[];const results=[];
async function clickText(text, root = "body") {
  await page.waitForFunction((text, root) => [...document.querySelectorAll(root + " button")].some((button) => button.textContent.trim() === text && !button.matches(":disabled")), {}, text, root);
  const handles = await page.$$(root + " button");
  for (const handle of handles) {
    const matches = await handle.evaluate((button, wanted) => button.textContent.trim() === wanted && !button.matches(":disabled"), text);
    if (matches) { await handle.click(); return; }
  }
  throw new Error("Enabled button not found: " + text);
}
async function fill(selector, value) {
  await page.waitForSelector(selector);
  const input = await page.$(selector);
  await input.focus(); await page.keyboard.down("Control"); await page.keyboard.press("A"); await page.keyboard.up("Control");
  await input.press("Backspace");
  if (value) await input.type(value);
}
async function fillLabel(labelText, value) {
  const labels = await page.$$("label");
  for (const label of labels) {
    if (await label.evaluate((element, text) => element.childNodes[0]?.textContent.trim() === text, labelText)) {
      const inputHandle = await label.evaluateHandle((element) => element.control || element.querySelector("input"));
      const input = inputHandle.asElement();
      if (!input) throw new Error("Input missing for label: " + labelText);
      await input.focus(); await page.keyboard.down("Control"); await page.keyboard.press("A"); await page.keyboard.up("Control"); await input.press("Backspace"); await input.type(value);
      return;
    }
  }
  throw new Error("Label not found: " + labelText);
}
async function selectLabel(labelText, value) {
  const labels = await page.$$("label");
  for (const label of labels) {
    if (await label.evaluate((element, text) => element.childNodes[0]?.textContent.trim() === text, labelText)) {
      const select = await label.$("select");
      if (!select) throw new Error("Select missing for label: " + labelText);
      await select.select(value); return;
    }
  }
  throw new Error("Select label not found: " + labelText);
}
async function visit(path, heading) {
  await page.bringToFront();
  await page.goto(origin + path, { waitUntil: "domcontentloaded" });
  await page.waitForFunction((text) => [...document.querySelectorAll("h1")].some((element) => element.textContent.trim() === text), {}, heading);
}
// Both SSR loaders and browser reads use this isolated Auth/PostgREST adapter.
const apiProxy=Bun.serve({hostname:"127.0.0.1",port:8082,async fetch(req){
 const url=new URL(req.url),body=await req.text();
 const request={method:()=>req.method,headers:()=>Object.fromEntries(req.headers),postData:()=>body};
  try{
   if(request.method()==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-headers":"*","access-control-allow-methods":"GET,POST,PATCH,DELETE,OPTIONS"}});
   let status=200,body,headers={"content-type":"application/json","access-control-allow-origin":"*"};
   if(url.pathname.startsWith("/auth/v1/token")){
    const input=JSON.parse(request.postData()||"{}");const role=String(input.email||"").split("@")[0];
    if(!ids[role]||input.password!=="IsolatedTestPassword!26"){status=400;body={error:"invalid_grant",error_description:"Invalid login credentials"};}
    else body={access_token:jwt(role),refresh_token:"test-"+role,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:"bearer",user:actor(role)};
   }else if(url.pathname==="/auth/v1/user"){
    const token=(request.headers().authorization||"").replace("Bearer ","");const claims=JSON.parse(Buffer.from(token.split(".")[1]||"","base64url").toString());const role=Object.keys(ids).find(r=>uuid(ids[r])===claims.sub);
    if(!role){status=401;body={message:"Invalid user"};}else body=actor(role);
   }else if(url.pathname==="/auth/v1/logout"){status=204;body=null;}
   else if(url.pathname.startsWith("/rest/v1")){
    const auth=request.headers().authorization;const token=auth?.startsWith("Bearer ey")?auth:undefined;
    const response=await fetch(api+url.pathname.replace("/rest/v1","")+url.search,{method:request.method(),headers:{"Content-Type":"application/json",Accept:request.headers().accept||"application/json",...(token?{Authorization:token}:{}),...(request.headers().prefer?{Prefer:request.headers().prefer}:{}),...(request.headers().range?{Range:request.headers().range}:{})},...(request.postData()?{body:request.postData()}:{})});
    status=response.status;body=await response.text();headers={...headers,...Object.fromEntries([...response.headers].filter(([name])=>["content-range","content-type","preference-applied"].includes(name)))};
   }else{status=404;body={error:"Unsupported test endpoint"};}
   return new Response(status===204?null:body===null?"":typeof body==="string"?body:JSON.stringify(body),{status,headers});
  }catch(error){return Response.json({error:error.message},{status:500,headers:{"access-control-allow-origin":"*"}});}

}});
async function attachProxy(target){target.on("pageerror",error=>pageErrors.push(error.message));}
async function login(role){await page.goto(origin+"/admin/login",{waitUntil:"domcontentloaded"});await page.waitForSelector('form[data-ready="true"]');await fill('input[type="email"]',role+"@example.test");await fill('input[type="password"]',"IsolatedTestPassword!26");await clickText("Sign in");await page.waitForSelector('a[href="/admin/manage"]');}
async function waitRow(table,field,value){for(let i=0;i<50;i++){const rows=await rest("/"+table+"?"+field+"=eq."+encodeURIComponent(value));if(rows?.length)return rows[0];await new Promise(r=>setTimeout(r,100));}throw new Error("Record not saved: "+table+" "+value);}
try{
 for(let i=0;i<60;i++){try{if((await fetch(origin+"/admin/login")).ok)break;}catch{}if(i===59)throw new Error("Server did not start: "+serverOutput);await new Promise(r=>setTimeout(r,1000));}
 browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});page=await browser.newPage();await page.setViewport({width:1440,height:1000});page.setDefaultTimeout(20000);page.on("dialog",d=>d.accept());await attachProxy(page);
 await login("admin");assert.equal(await page.evaluate(()=>localStorage.getItem("avrasya-admin-db-v4")),null);assert.equal(await page.$eval('[data-admin-mode]',e=>e.dataset.adminMode),"live");results.push("Normal builds use PostgreSQL even with a stray demo flag");
 await visit("/admin/contacts","Contacts");await clickText("Add contact");await fillLabel("Name","Persistent buyer");await fillLabel("Email","persistent@example.test");await clickText("Save contact");await waitRow("contacts","name","Persistent buyer");await page.reload({waitUntil:"domcontentloaded"});await page.waitForFunction(()=>document.body.textContent.includes("Persistent buyer"));results.push("Contact CRUD persists in PostgreSQL after reload");
 await visit("/admin/properties","Properties");await clickText("New property");await page.waitForSelector('input[placeholder="Unknown"]');await fillLabel("Title","Persistent property");await fillLabel("District","Test district");await selectLabel("Availability","Available");await selectLabel("Development name","Test development");await fillLabel("Bathrooms","2");await fillLabel("Description","Approved persistent description");await clickText("Save changes");let property=await waitRow("marketing_offers","marketing_title","Persistent property");
 await page.waitForFunction(()=>[...document.querySelectorAll("label")].some(label=>label.textContent.startsWith("Development name")&&label.querySelector("select")?.value==="Test development"));
 await rest("/rpc/link_physical_unit","POST",{p_offer:property.id,p_unit:uuid(2001),p_version:property.version});await page.reload({waitUntil:"domcontentloaded"});await page.waitForSelector('input[placeholder="Unknown"]');await clickText("Pricing");await fillLabel("Amount","420000");await selectLabel("Price type","fixed");await clickText("Save changes");await page.waitForFunction(()=>[...document.querySelectorAll("[data-sonner-toast]")].some(x=>x.textContent.includes("Saved")));
 await clickText("Media");await fillLabel("Image URL","/images/properties/hero-main.jpg");await clickText("Save changes");await waitRow("marketing_offers","cover_image_path","/images/properties/hero-main.jpg");
 await clickText("Website Preview");await page.waitForSelector("[data-property-detail]");await page.waitForFunction(()=>document.querySelector("[data-property-detail]")?.textContent.includes("Approved persistent description"));
 assert.equal(await page.$eval("[data-property-detail]",e=>e.textContent.includes("Miele / Gaggenau")),false);
 assert.equal(await page.$eval("[data-property-detail] form fieldset",e=>e.disabled),true);
 results.push("Admin preview uses the public layout, edited details and disabled enquiry submission");
 await clickText("Publish");await waitRow("marketing_offers","publication","Published");const catalogue=await rest("/rpc/published_catalogue","POST",{},jwt("admin"));assert.equal(catalogue.length,1);results.push("Property edit, unit linking and atomic publication");
 await visit("/admin/settings","Website settings");await fillLabel("Brand Name","Persistent brand");await clickText("Save website settings");await waitRow("site_settings","company_name","Persistent brand");
 // Separate storage/cookies means browser events cannot make this check pass.
 const publicContext=await browser.createBrowserContext();
 const publicPage=await publicContext.newPage();
 // Emulate a visitor on another visible device while the admin tab receives clicks.
 await publicPage.evaluateOnNewDocument(()=>Object.defineProperty(document,"visibilityState",{get:()=>"visible"}));
 await attachProxy(publicPage);await publicPage.goto(origin+"/properties",{waitUntil:"domcontentloaded"});await publicPage.waitForFunction(()=>document.body.textContent.includes("Persistent property"));await publicPage.waitForFunction(()=>document.body.textContent.includes("Persistent brand"));assert.equal(await publicPage.$eval('meta[name="avrasya-data-mode"]',e=>e.content),"live");await publicPage.goto(origin+"/properties/"+property.slug,{waitUntil:"domcontentloaded"});await publicPage.waitForSelector("[data-property-detail]");
 assert.equal(await publicPage.$eval("[data-property-detail]",e=>e.textContent.includes("Approved persistent description")),true);
 assert.equal(await publicPage.$eval("[data-property-detail]",e=>e.textContent.includes("Citizenship eligibility verified")),false);
 await visit("/admin/properties/"+property.id,"Persistent property");await fillLabel("Description","Changed while the website stays open");await clickText("Save changes");await waitRow("marketing_offers","description","Changed while the website stays open");
 await publicPage.waitForFunction(()=>document.querySelector("[data-property-detail]")?.textContent.includes("Changed while the website stays open"),{timeout:10000,polling:"mutation"});
 results.push("A separate visitor context refreshes published details within 10 seconds without browser signals");
 await visit("/admin/settings","Website settings");await clickText("Homepage");await fill("#cms-heroHeadline","Managed homepage headline");await clickText("Save website settings");await waitRow("site_settings","hero_headline","Managed homepage headline");await publicPage.bringToFront();await publicPage.goto(origin+"/",{waitUntil:"domcontentloaded"});await publicPage.waitForFunction(()=>document.querySelector("h1")?.textContent.includes("Managed homepage headline"));assert.equal(await publicPage.evaluate(()=>document.body.textContent.includes("Browse 1 property")),true);assert.equal(await publicPage.evaluate(()=>/3409821|849201|Alexander & Elena Becker|Coordinated Volume/.test(document.body.textContent)),false);await publicPage.close();results.push("Homepage heading and shared website settings follow saved admin fields");
 await visit("/admin/inquiries","Enquiries");await clickText("Add enquiry");await page.waitForSelector("form textarea");const inputs=await page.$$("form input");await inputs[0].type("Persistent enquiry");await inputs[1].type("enquiry@example.test");await page.type("form textarea","Please advise on this unit.");await clickText("Save to Inbox");await waitRow("enquiries","name","Persistent enquiry");
 for(const row of await page.$$("tbody tr"))if(await row.evaluate(node=>node.textContent.includes("Persistent enquiry"))){await row.click();break;}
 await clickText("Create buyer enquiry");await page.waitForFunction(()=>location.pathname.startsWith("/admin/leads/"));await clickText("Convert to deal");await page.waitForFunction(()=>location.pathname==="/admin/deals");let deals=await rest("/deals");assert.equal(deals.length,1);assert.equal((await rest("/deal_selected_units")).length,0);results.push("Enquiry to lead to opportunity persists without inventing selected units");
 await clickText("Edit details");await fillLabel("Agreed amount","420000");const checkbox=await page.$('input[type="checkbox"]');await checkbox.click();await clickText("Save details");await waitRow("deal_selected_units","deal_id",deals[0].id);
 for(const [button,stage] of [["Move to Offer Prepared","Offer Prepared"],["Move to Offer Accepted","Offer Accepted"],["Move to Reserved","Reserved"],["Move to Due Diligence","Due Diligence"],["Move to Contract","Contract"],["Complete","Won"]]) {await clickText(button);await waitRow("deals","stage",stage);}assert.equal((await rest("/physical_units?id=eq."+uuid(2001)))[0].status,"Sold");results.push("Real RPC transitions reserve and complete only the chosen physical unit");
 await visit("/admin/manage","Website and team");await clickText("Questions and answers");await clickText("Add questions and answers");await fillLabel("Question","Database FAQ");await fillLabel("Answer","Managed answer");await clickText("Save");await waitRow("faqs","question","Database FAQ");results.push("CMS management writes to the public content database");
 await clickText("Website pages");await clickText("Add website pages");await selectLabel("Page address","about");await fillLabel("Page title","Managed about page");await selectLabel("Website status","Published");await clickText("Save");const authored=await waitRow("content_pages","slug","about");
 await clickText("Page sections");await clickText("Add page sections");await selectLabel("Content page",authored.id);await fillLabel("Section name","intro");await page.type("form textarea","Managed first paragraph.\n\nManaged second paragraph.");await clickText("Save");await waitRow("content_sections","section_key","intro");
 const contentPage=await browser.newPage();await attachProxy(contentPage);await contentPage.goto(origin+"/about",{waitUntil:"domcontentloaded"});await contentPage.waitForFunction(()=>document.body.textContent.includes("Managed second paragraph."));await contentPage.close();results.push("Plain-text page editing is published to the website");
 await visit("/admin/properties/"+property.id,"Persistent property");await clickText("Unpublish");await waitRow("marketing_offers","publication","Draft");
 const hiddenPage=await browser.newPage();await attachProxy(hiddenPage);await hiddenPage.goto(origin+"/properties",{waitUntil:"domcontentloaded"});await hiddenPage.waitForFunction(()=>!document.querySelector('[role="status"]')?.textContent.includes("Loading current offers"));assert.equal(await hiddenPage.evaluate(()=>[...document.querySelectorAll("main h2")].some(h=>h.textContent.includes("Persistent property"))),false);await hiddenPage.close();results.push("Unpublishing removes the listing from public browsing");
 

 for(const width of [320,390,768]){
  await page.setViewport({width,height:844,isMobile:width<768,hasTouch:width<768});
  for(const [path,heading] of [["/admin/settings","Website settings"],["/admin/properties/"+property.id,"Persistent property"],["/admin/manage","Website and team"]]){
   await visit(path,heading);
   if(path.includes(property.id)){await clickText("Website Preview");await page.waitForSelector("[data-property-detail]");assert.equal(await page.$eval("[data-property-detail] form fieldset",e=>e.disabled),true);}
   const sizes=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
   assert.ok(sizes.document<=width+1&&sizes.body<=width+1,"Admin mobile overflow on "+path+": "+JSON.stringify(sizes));
  }
 }
 results.push("Authenticated mobile settings, listing preview and management fit 320px, 390px and tablet widths");
 await page.setViewport({width:1440,height:1000});
 await page.click('[aria-label="Log out"]');await page.waitForSelector('input[type="email"]');await login("viewer");await visit("/admin/settings","Website settings");assert.equal(await page.$eval("#cms-fields",e=>e.disabled),true);results.push("Viewer has read-only management controls");
 assert.deepEqual(pageErrors,[]);console.log(JSON.stringify({persistentBrowserChecks:results},null,2));
}catch(error){await mkdir("test-results",{recursive:true});await page?.screenshot({path:"test-results/backend-smoke-failure.png",fullPage:true}).catch(()=>{});console.error("Persistent browser failure:",error.stack);console.error("Passed:",JSON.stringify(results));console.error("Page errors:",pageErrors);if(page)console.error(await page.evaluate(()=>document.body.innerText.slice(0,3500)).catch(()=>""));console.error("Database listing:",await rest("/marketing_offers?select=id,marketing_title,description,version,project_id,publication").catch(e=>e.message));
 for(const tab of await browser?.pages()||[]){console.error("Tab:",tab.url(),await tab.evaluate(()=>({body:document.body.innerText.slice(-2500),toasts:[...document.querySelectorAll("[data-sonner-toast]")].map(t=>t.textContent),description:[...document.querySelectorAll("textarea")].map(t=>t.value)})).catch(()=>null));}
 console.error(serverOutput);process.exitCode=1;}
finally{await browser?.close();child.kill("SIGTERM");apiProxy.stop(true);}
