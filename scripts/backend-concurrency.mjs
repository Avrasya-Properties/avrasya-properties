import assert from "node:assert/strict";
import {spawn} from "node:child_process";
const u="00000000-0000-4000-8000-000000008001",session="00000000-0000-4000-8000-000000008101";
const unit="00000000-0000-4000-8000-000000008201",contact="00000000-0000-4000-8000-000000008301";
const offerA="00000000-0000-4000-8000-000000008401",offerB="00000000-0000-4000-8000-000000008402";
const dealA="00000000-0000-4000-8000-000000008501",dealB="00000000-0000-4000-8000-000000008502";
const claims=JSON.stringify({role:"authenticated",sub:u,session_id:session});
function query(sql){return new Promise((resolve,reject)=>{const child=spawn("psql",["-h","127.0.0.1","-U","postgres","-d","postgres","-v","ON_ERROR_STOP=1","-At"],{stdio:["pipe","pipe","pipe"],env:process.env});let out="",err="";child.stdout.on("data",c=>out+=c);child.stderr.on("data",c=>err+=c);child.on("error",reject);child.on("close",code=>code===0?resolve(out.trim()):reject(new Error(err)));child.stdin.end(sql);});}
const cleanup=`delete from deals where id in ('${dealA}','${dealB}');delete from marketing_offers where id in ('${offerA}','${offerB}');delete from physical_units where id='${unit}';delete from contacts where id='${contact}';delete from staff_profiles where id='${u}';delete from auth.sessions where id='${session}';delete from auth.users where id='${u}';`;
try{
 await query(`insert into auth.users values('${u}');insert into auth.sessions values('${session}','${u}');insert into staff_profiles(id,email,name,role) values('${u}','concurrency@example.test','Concurrency manager','manager');insert into contacts(id,name,assigned_agent_id) values('${contact}','Concurrency buyer','${u}');insert into physical_units(id,unit_number,status) values('${unit}','CONCURRENT-21','Available');insert into marketing_offers(id,ref,slug,marketing_title,district,record_type,physical_unit_id,availability) values('${offerA}','CONCUR-A','concur-a','Offer A','Test','unit_offer','${unit}','Available'),('${offerB}','CONCUR-B','concur-b','Offer B','Test','unit_offer','${unit}','Available');`);
 await query(`insert into deals(id,title,contact_id,assigned_agent_id,stage,total_amount,currency) values('${dealA}','Deal A','${contact}','${u}','Offer Accepted',420000,'USD'),('${dealB}','Deal B','${contact}','${u}','Offer Accepted',420000,'USD');insert into deal_selected_units(deal_id,offer_id,physical_unit_id,currency) values('${dealA}','${offerA}','${unit}','USD'),('${dealB}','${offerB}','${unit}','USD');`);
 const reserve=id=>query(`begin;set local statement_timeout='10s';set local role authenticated;select set_config('request.jwt.claims','${claims}',true);select public.transition_deal('${id}','Reserved',1);select pg_sleep(0.3);commit;`);
 const results=await Promise.allSettled([reserve(dealA),reserve(dealB)]);
 assert.equal(results.filter(r=>r.status==="fulfilled").length,1,"Exactly one concurrent reservation wins");
 const failed=results.find(r=>r.status==="rejected");assert.match(failed.reason.message,/Selected unit is not available/);assert(!/deadlock/i.test(failed.reason.message));
 assert.equal(await query(`select count(*) from reservations where physical_unit_id='${unit}' and status='active';`),"1");
 assert.equal(await query(`select status from physical_units where id='${unit}';`),"Reserved");
 console.log("PASS: concurrent offers for one physical unit produce one reservation without deadlock");
}finally{await query(cleanup);}
