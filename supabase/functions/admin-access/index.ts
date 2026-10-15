// Public password entry point; privileged actions below require a verified live session.
// No credentials, recovery tokens, or complete email provider responses are logged.
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{...cors,'Cache-Control':'no-store'}});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return respond({error:'Use POST.'},405);
 const base=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 const mailKey=Deno.env.get('RESEND_API_KEY'),sender=Deno.env.get('ADMIN_MAIL_FROM'),site=Deno.env.get('ADMIN_SITE_URL');
 if(!base||!secret)return respond({error:'The sign-in service is unavailable.'},503);
 const headers={apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'};
 const request=async(path:string,body:unknown,extra:RequestInit={})=>fetch(base+path,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(12000),...extra});
 const rpc=async(name:string,body:unknown)=>{const response=await request('/rest/v1/rpc/'+name,body);if(!response.ok)throw Error('Security state could not be saved.');return response.json();};
 const send=async(to:string,subject:string,text:string,key?:string)=>{
  if(!mailKey||!sender)throw Error('Security email sending is not configured.');
  const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:'Bearer '+mailKey,'Content-Type':'application/json',...(key?{'Idempotency-Key':key}:{})},body:JSON.stringify({from:sender,to:[to],subject,text})});
  if(!response.ok)throw Error('The email provider rejected the message.');
  const data=await response.json();if(typeof data.id!=='string')throw Error('The email provider did not confirm acceptance.');return data.id;
 };
 const deliverAlerts=async()=>{
  if(!mailKey||!sender)return {configured:false,sent:0};
  const mails=await rpc('admin_mail_claim',{});let sent=0;
  for(const mail of mails){try{const id=await send(mail.recipient,'Avrasya admin: sign-in temporarily blocked',`Three incorrect passwords were entered for an Avrasya staff account at ${mail.created_at}. New sign-ins are blocked for 15 minutes. Existing signed-in work is preserved. If this was not you, review your password and team access. Passwords are never included in this alert.`, 'admin-lock-'+mail.id);await rpc('admin_mail_finish',{p_id:mail.id,p_provider:id,p_error:null});sent++;}catch{await rpc('admin_mail_finish',{p_id:mail.id,p_provider:null,p_error:'Email delivery failed; queued for retry.'});}}
  return {configured:true,sent};
 };
 try{
  if(Number(req.headers.get('content-length')||0)>16384)return respond({error:'Request too large.'},413);
  const raw=await req.text();if(raw.length>16384)return respond({error:'Request too large.'},413);
  const body=JSON.parse(raw);const action=body.action;
  if(action==='status'||action==='retry-alerts'||action==='complete-recovery'){
   const authorization=req.headers.get('authorization')||'';
   if(!/^Bearer \S+$/.test(authorization)||authorization==='Bearer '+secret)return respond({error:'Sign in to continue.'},401);
   const verified=await fetch(base+'/auth/v1/user',{headers:{apikey:secret,Authorization:authorization},signal:AbortSignal.timeout(12000)});
   if(!verified.ok)return respond({error:'Your session ended. Sign in again.'},401);
   const account=await verified.json();
   // Caller JWT applies the live-session and account-block checks in staff RLS.
   const profileResponse=await fetch(base+'/rest/v1/staff_profiles?id=eq.'+encodeURIComponent(account.id)+'&select=role,is_active',{headers:{apikey:secret,Authorization:action==='complete-recovery'?headers.Authorization:authorization},signal:AbortSignal.timeout(12000)});
   const profiles=profileResponse.ok?await profileResponse.json():[];const profile=profiles[0];
   if(!profile?.is_active)return respond({error:'Staff access is unavailable.'},403);
   if(action==='complete-recovery'){
    const payload=authorization.slice(7).split('.')[1];
    const claims=JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
    if(typeof claims.session_id!=='string'||!await rpc('admin_recovery_session',{p_user:account.id,p_session:claims.session_id}))return respond({error:'Your recovery session ended. Request a new link.'},401);
    const password=String(body.password||'');if(password.length<12||password.length>256)return respond({error:'Use 12 to 256 characters.'},400);
    const updated=await request('/auth/v1/admin/users/'+encodeURIComponent(account.id),{password},{method:'PUT'});
    if(!updated.ok)return respond({error:'Password could not be updated. Try again.'},400);
    await rpc('admin_recovery_finish',{p_user:account.id});
    await request('/auth/v1/logout?scope=others',{}, {headers:{...headers,Authorization:authorization}});
    return respond({ok:true});
   }
   if(profile.role!=='admin')return respond({error:'Administrator access required.'},403);
   const mail=action==='retry-alerts'?await deliverAlerts():{configured:!!mailKey&&!!sender};
   const queue=await rpc('admin_mail_status',{});
   return respond({pending_alerts:queue.pending,alerts_needing_attention:queue.needs_attention,idle_minutes:10,wrong_attempts:3,block_minutes:15,recovery_email:'info.avrasyaproperties@gmail.com',mail_configured:mail.configured,recovery_configured:mail.configured&&!!site,sent:'sent' in mail?mail.sent:undefined});
  }
  const email=String(body.email||'').trim().toLowerCase();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return respond({error:'Enter a valid team email.'},400);
  if(action==='recover'){
   if(!mailKey||!sender||!site)return respond({error:'Recovery email sending is not configured yet. Contact the account owner.'},503);
   const siteUrl=new URL(site);if(siteUrl.protocol!=='https:')throw Error('Recovery address must use HTTPS.');
   const account=await rpc('admin_recovery_begin',{p_email:email});
   if(account.unknown||account.throttled)return respond({ok:true});
   const response=await request('/auth/v1/admin/generate_link',{type:'recovery',email:account.email});
   if(!response.ok)throw Error('Recovery link could not be generated.');
   const generated=await response.json();if(!generated.hashed_token)throw Error('Recovery link could not be generated.');
   const link=new URL('/admin/recover',siteUrl);link.hash=new URLSearchParams({token_hash:generated.hashed_token,type:'recovery'}).toString();
   await send(account.recipient,'Reset your Avrasya admin password',`A password reset was requested for ${account.email}. Open this link to choose a new password:\n\n${link}\n\nIf you did not request it, ignore this message. Your primary sign-in email is unchanged.`);
   return respond({ok:true});
  }
  if(action!=='sign-in')return respond({error:'Unknown request.'},400);
  const password=String(body.password||'');if(!password||password.length>256)return respond({error:'Enter your password.'},400);
  const attempt=crypto.randomUUID();const state=await rpc('admin_login_begin',{p_email:email,p_attempt:attempt});
  if(state.blocked_until)return respond({error:'Too many incorrect passwords. Try again after 15 minutes or use password recovery.',blocked_until:state.blocked_until},429);
  if(state.busy)return respond({error:'A sign-in is already being checked. Wait a moment and try again.'},409);
  if(state.unknown)return respond({error:'Email or password is incorrect.'},401);
  const auth=await request('/auth/v1/token?grant_type=password',{email:state.email,password});
  const data=await auth.json();
  if(auth.ok){
   if(data.user?.id!==state.user_id||!data.access_token||!data.refresh_token)throw Error('Account mismatch.');
   const result=await rpc('admin_login_finish',{p_user:state.user_id,p_attempt:attempt,p_valid:true});
   if(!result.ok){await request('/auth/v1/logout',{}, {headers:{...headers,Authorization:'Bearer '+data.access_token}});return respond({error:'Sign-in is temporarily blocked.'},429);}
   await deliverAlerts().catch(()=>undefined);return respond({access_token:data.access_token,refresh_token:data.refresh_token});
  }
  // Network, rate-limit, and service failures do not count as incorrect passwords.
  if(data.code!=='invalid_credentials'&&data.error_code!=='invalid_credentials'){
   await rpc('admin_login_finish',{p_user:state.user_id,p_attempt:attempt,p_valid:null});return respond({error:'Sign-in is temporarily unavailable. Try again shortly.'},503);
  }
  const result=await rpc('admin_login_finish',{p_user:state.user_id,p_attempt:attempt,p_valid:false});
  if(result.blocked_until){const mail=await deliverAlerts();return respond({error:'Three incorrect passwords. Sign-in is blocked for 15 minutes.'+(!mail.configured?' The security alert is queued; email sending needs configuration.':''),blocked_until:result.blocked_until},429);}
  return respond({error:'Email or password is incorrect.'},401);
 }catch{return respond({error:'The request could not be completed. Try again shortly.'},503);}
});
