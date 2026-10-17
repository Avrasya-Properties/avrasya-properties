// Public submission endpoint. Custom project-key authentication; no privileged key reaches the browser.
// Override with the WEBSITE_PUBLISHABLE_KEY secret when the project key is rotated or a staging project is used.
const projectKey=Deno.env.get("WEBSITE_PUBLISHABLE_KEY")||"sb_publishable_vmlTaa9tPFNuR3z_ADhOfA_XeH4oHUx";
const json=(body:unknown,status:number,headers:HeadersInit)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...headers}});
const hash=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,"0")).join("");
Deno.serve(async(req:Request)=>{
 const allowed=(Deno.env.get("WEBSITE_ALLOWED_ORIGINS")||"").split(",").map(x=>x.trim()).filter(Boolean);
 const origin=req.headers.get("origin")||"";
 const headers={"Access-Control-Allow-Origin":allowed.includes(origin)?origin:"null","Access-Control-Allow-Headers":"apikey,authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};
 if(!allowed.length)return json({error:"Enquiry submission is not configured. Please contact our advisory team."},503,headers);
 if(!allowed.includes(origin))return json({error:"Origin not allowed."},403,headers);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return json({error:"Method not allowed."},405,headers);
 if(req.headers.get("apikey")!==projectKey)return json({error:"Invalid project key."},401,headers);
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
 return json({receipt:await response.json()},201,headers);
 }catch{return json({error:"Submission failed. Please try again."},400,headers);}
});
