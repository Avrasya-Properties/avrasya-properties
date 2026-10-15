import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const valid='header.'+Buffer.from(JSON.stringify({session_id:'live-session'})).toString('base64url')+'.signature';
let handler,failures=0,blocked=false,lease=false,authStatus=200,mailStatus=200,calls=[],alerts=[],hookValidId='staff';
const env={SUPABASE_URL:'https://isolated.example',SUPABASE_SERVICE_ROLE_KEY:'server-only',RESEND_API_KEY:'mail-secret',ADMIN_MAIL_FROM:'Verified sender <security@example.test>',ADMIN_SITE_URL:'https://website.example.test'};
const source=await readFile('supabase/functions/admin-access/index.ts','utf8');
const mockFetch=async(url,options={})=>{
 const body=options.body?JSON.parse(options.body):null;calls.push({url,body,options});
 if(url.endsWith('/rpc/admin_login_begin')){if(body.p_email==='unknown@example.test')return Response.json({unknown:true});if(blocked)return Response.json({blocked_until:'2026-10-15T01:00:00Z'});if(lease)return Response.json({busy:true});lease=true;return Response.json({user_id:'staff',email:'admin@avrasyaproperties.com'});}
 if(url.endsWith('/rpc/admin_login_finish')){lease=false;if(body.p_valid===false){failures++;if(failures===3){blocked=true;alerts.push({id:'alert',recipient:'info.avrasyaproperties@gmail.com',created_at:'2026-10-15T00:00:00Z'});}return Response.json({blocked_until:blocked?'2026-10-15T01:00:00Z':null});}if(body.p_valid===true)failures=0;return Response.json({ok:true});}
 if(url.endsWith('/rpc/admin_mail_status'))return Response.json({pending:alerts.length,needs_attention:0});
 if(url.endsWith('/rpc/admin_mail_claim')){const batch=alerts.splice(0);return Response.json(batch);}
 if(url.endsWith('/rpc/admin_mail_finish'))return Response.json(null);
 if(url.endsWith('/rpc/admin_recovery_begin'))return Response.json(body.p_email==='unknown@example.test'?{unknown:true}:{user_id:'staff',email:'admin@avrasyaproperties.com',recipient:'info.avrasyaproperties@gmail.com'});
 if(url.endsWith('/rpc/admin_recovery_session'))return Response.json(true);
 if(url.endsWith('/auth/v1/logout?scope=others'))return new Response(null,{status:204});
 if(url.endsWith('/rpc/admin_recovery_finish')){blocked=false;failures=0;return Response.json(null);}
 if(url.includes('/auth/v1/token'))return Response.json(authStatus===200?{access_token:'access',refresh_token:'refresh',user:{id:hookValidId}}:{error_code:authStatus===400?'invalid_credentials':'service_error'},{status:authStatus});
 if(url.endsWith('/auth/v1/user'))return Response.json(options.headers.Authorization==='Bearer '+valid?{id:'staff'}:{},{status:options.headers.Authorization==='Bearer '+valid?200:401});
 if(url.includes('staff_profiles?'))return Response.json([{role:'admin',is_active:true}]);
 if(url.endsWith('/auth/v1/admin/users/staff'))return Response.json({id:'staff'});
 if(url.endsWith('/auth/v1/admin/generate_link'))return Response.json({hashed_token:'single-use-recovery-token'});
 if(url==='https://api.resend.com/emails')return Response.json(mailStatus===200?{id:'provider-id'}:{error:'rejected'},{status:mailStatus});
 throw Error('Unexpected request: '+url);
};
new Function('Deno','fetch',new Bun.Transpiler({loader:'ts'}).transformSync(source))({env:{get:n=>env[n]},serve:fn=>handler=fn},mockFetch);
const req=(body,token)=>new Request('https://isolated.example/functions/v1/admin-access',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
const input={action:'sign-in',email:'admin@avrasyaproperties.com',password:'isolated-test-only'};
assert.equal((await handler(req({...input,email:'unknown@example.test'}))).status,401);
authStatus=400;
assert.equal((await handler(req(input))).status,401);assert.equal(failures,1);
authStatus=503;assert.equal((await handler(req(input))).status,503);assert.equal(failures,1);
authStatus=400;assert.equal((await handler(req(input))).status,401);assert.equal(failures,2);
calls=[];assert.equal((await handler(req(input))).status,429);assert.equal(failures,3);
const mail=calls.find(c=>c.url==='https://api.resend.com/emails');assert.deepEqual(mail.body.to,['info.avrasyaproperties@gmail.com']);assert.equal(mail.options.headers['Idempotency-Key'],'admin-lock-alert');assert.equal(mail.body.text.includes(input.password),false);
authStatus=200;calls=[];assert.equal((await handler(req(input))).status,429);assert.equal(calls.some(c=>c.url.includes('/auth/v1/token')),false);
blocked=false;calls=[];assert.equal((await handler(req(input))).status,200);assert.equal(failures,0);assert.equal(calls.at(1).options.headers.Authorization,'Bearer server-only');
assert.equal((await handler(req({action:'status'}))).status,401);assert.equal((await handler(req({action:'status'},'invalid'))).status,401);
const status=await (await handler(req({action:'status'},valid))).json();assert.equal(status.recovery_email,'info.avrasyaproperties@gmail.com');
calls=[];assert.equal((await handler(req({action:'recover',email:input.email}))).status,200);
const recovery=calls.find(c=>c.url==='https://api.resend.com/emails');assert.deepEqual(recovery.body.to,['info.avrasyaproperties@gmail.com']);assert.ok(recovery.body.text.includes('https://website.example.test/admin/recover#token_hash='));assert.equal(recovery.body.text.includes(input.password),false);
calls=[];assert.equal((await handler(req({action:'recover',email:'unknown@example.test'}))).status,200);assert.equal(calls.some(c=>c.url==='https://api.resend.com/emails'),false);
assert.equal((await handler(req({action:'complete-recovery',password:'short'},valid))).status,400);
blocked=true;assert.equal((await handler(req({action:'complete-recovery',password:'new-isolated-password'},valid))).status,200);assert.equal(blocked,false);
delete env.RESEND_API_KEY;calls=[];assert.equal((await handler(req({action:'recover',email:input.email}))).status,503);assert.equal(calls.length,0);
failures=2;authStatus=400;assert.equal((await handler(req(input))).status,429);assert.equal(alerts.length,1);
console.log('PASS: actual Edge handler paths for attempts, blocks, outage preservation, alert recipient, recovery, verified access and missing mail configuration');
