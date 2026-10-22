// Public submission endpoint. Custom project-key authentication; no privileged key reaches the browser.
const projectKey="sb_publishable_vmlTaa9tPFNuR3z_ADhOfA_XeH4oHUx";
// Override with the WEBSITE_PUBLISHABLE_KEY secret when the project key is rotated or a staging project is used.
const acceptedKey=()=>Deno.env.get("WEBSITE_PUBLISHABLE_KEY")||projectKey;
const json=(body:unknown,status:number,headers:HeadersInit)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...headers}});
// Best-effort staff alert. The enquiry is already saved when this runs, so a mail failure never fails the visitor.
// Requires RESEND_API_KEY, ADMIN_MAIL_FROM and ENQUIRY_NOTIFY_EMAIL (comma separated); otherwise it is skipped.
const notifyStaff=async(receipt:string,p:Record<string,string|null>)=>{
 const key=Deno.env.get("RESEND_API_KEY"),from=Deno.env.get("ADMIN_MAIL_FROM"),to=(Deno.env.get("ENQUIRY_NOTIFY_EMAIL")||"").split(",").map(x=>x.trim()).filter(Boolean);
 if(!key||!from||!to.length)return;
 const site=Deno.env.get("ADMIN_SITE_URL")||"";
 const text=["New website enquiry "+receipt,"","Name: "+p.name,"Email: "+p.email,"Phone: "+p.phone,"Topic: "+p.topic,p.budget?"Budget: "+p.budget:"",p.property_slug?"Property: "+(site?site.replace(/\/$/,"")+"/properties/"+p.property_slug:p.property_slug):"","","Message:",String(p.message||""),"",site?"Open the enquiry inbox: "+site.replace(/\/$/,"")+"/admin/inquiries":""].filter((line,i,all)=>line!==""||all[i-1]!=="").join("\n");
 try{await fetch("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(8000),headers:{Authorization:"Bearer "+key,"Content-Type":"application/json","Idempotency-Key":"enquiry-"+receipt},body:JSON.stringify({from,to,reply_to:p.email||undefined,subject:"New enquiry "+receipt+" - "+String(p.topic||"Website"),text})});}catch{/* Delivery is retried from the admin inbox; nothing to log here. */}
};
const hash=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,"0")).join("");
Deno.serve(async(req:Request)=>{
 const allowed=(Deno.env.get("WEBSITE_ALLOWED_ORIGINS")||"").split(",").map(x=>x.trim()).filter(Boolean);
 const origin=req.headers.get("origin")||"";
 const headers={"Access-Control-Allow-Origin":allowed.includes(origin)?origin:"null","Access-Control-Allow-Headers":"apikey,authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};
 if(!allowed.length)return json({error:"Enquiry submission is not configured. Please contact our advisory team."},503,headers);
 if(!allowed.includes(origin))return json({error:"Origin not allowed."},403,headers);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return json({error:"Method not allowed."},405,headers);
 if(req.headers.get("apikey")!==acceptedKey())return json({error:"Invalid project key."},401,headers);
 if(Number(req.headers.get("content-length")||0)>16384)return json({error:"Request too large."},413,headers);
 try{
 const text=await req.text();if(text.length>16384)return json({error:"Request too large."},413,headers);
 const input=JSON.parse(text);if(input.website)return json({error:"Invalid submission."},400,headers);
 if(input.consent!==true)return json({error:"Please consent to being contacted."},400,headers);
 const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");const url=Deno.env.get("SUPABASE_URL");if(!secret||!url)return json({error:"Submission unavailable."},503,headers);
 // Use the last forwarding hop supplied by the gateway, never a caller-controlled prefix.
 const ip=(req.headers.get("x-forwarded-for")||"").split(",").at(-1)?.trim();
 if(!ip)return json({error:"Client address unavailable."},503,headers);
 const captcha=Deno.env.get("TURNSTILE_SECRET_KEY");
 if(captcha){const res=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:new URLSearchParams({secret:captcha,response:String(input.captchaToken||""),remoteip:ip})});const result=await res.json();if(!result.success)return json({error:"Complete the verification challenge."},400,headers);}
 const payload={name:String(input.name||""),email:String(input.email||""),phone:String(input.phone||""),topic:String(input.topic||""),budget:String(input.budget||""),message:String(input.message||""),property_slug:typeof input.propertySlug==="string"?input.propertySlug:null,idempotency_key:String(input.idempotencyKey||"")};
 const rateKey=await hash(secret+":"+ip);const payloadHash=await hash(JSON.stringify({...payload,idempotency_key:undefined}));
 const response=await fetch(url+"/rest/v1/rpc/accept_enquiry",{method:"POST",headers:{apikey:secret,Authorization:"Bearer "+secret,"Content-Type":"application/json"},body:JSON.stringify({p_data:payload,p_rate_key:rateKey,p_payload_hash:payloadHash})});
 if(!response.ok){const error=await response.json();const rate=String(error.message||"").includes("Too many");return json({error:rate?"Too many enquiries. Please try again later.":"We could not save the enquiry. Check your details and try again."},rate?429:400,headers);}
 const receipt=await response.json();
 if(typeof receipt==="string"&&receipt){const pending=notifyStaff(receipt,payload);const runtime=(globalThis as {EdgeRuntime?:{waitUntil(p:Promise<unknown>):void}}).EdgeRuntime;if(runtime)runtime.waitUntil(pending);else await pending;}
 return json({receipt},201,headers);
 }catch{return json({error:"Submission failed. Please try again."},400,headers);}
});
