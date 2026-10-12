// Account creation is restricted to an active administrator with a live Auth session.
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"};
const respond=(data:unknown,status:number)=>new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST")return respond({error:"Use POST."},405);
 const bearer=req.headers.get("Authorization")||"";if(!bearer.startsWith("Bearer "))return respond({error:"Please sign in."},401);
 const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const callerHeaders={apikey:key,Authorization:bearer};
 try{
 const verified=await fetch(url+"/auth/v1/user",{headers:callerHeaders});const caller=await verified.json();
 if(!verified.ok||!caller.id)return respond({error:"Please sign in again."},401);
 // Read with the caller's JWT: RLS checks active membership and auth.sessions.
 const access=await fetch(url+"/rest/v1/staff_profiles?id=eq."+caller.id+"&select=role,is_active",{headers:callerHeaders});const rows=await access.json();
 if(!access.ok||rows[0]?.role!=="admin"||rows[0]?.is_active!==true)return respond({error:"Only administrators can create team accounts."},403);
 const raw=await req.text();if(raw.length>4096)return respond({error:"Request is too large."},413);const input=JSON.parse(raw);
 const email=String(input.email||"").trim().toLowerCase(),name=String(input.name||"").trim(),role=String(input.role||""),password=input.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!name||name.length>120||!["admin","manager","agent","viewer"].includes(role)||typeof password!=="string"||password.length<12||password.length>128)return respond({error:"Enter a name, valid email, role and a password of 12–128 characters."},400);
 const headers={apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"};
 const created=await fetch(url+"/auth/v1/admin/users",{method:"POST",headers,body:JSON.stringify({email,password,email_confirm:true,user_metadata:{name}})});
 const account=await created.json();const id=account.id||account.user?.id;
 if(!created.ok||!id)return respond({error:"The account could not be created. Check whether this email already has an account."},409);
 const profile=await fetch(url+"/rest/v1/staff_profiles",{method:"POST",headers,body:JSON.stringify({id,email,name,role,is_active:true})});
 if(!profile.ok){await fetch(url+"/auth/v1/admin/users/"+id,{method:"DELETE",headers});return respond({error:"Staff access could not be saved. No usable team account was created."},500);}
 return respond({id,email,name,role},201);
 }catch{return respond({error:"The account could not be created. Please try again."},400);}
});
