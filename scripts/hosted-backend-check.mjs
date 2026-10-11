// Read-only hosted acceptance checks. Uses a publishable key, never a service key.
import assert from "node:assert/strict";

const base = "https://ufcpvjhzitmxgitoaolx.supabase.co";
const key = "sb_publishable_vmlTaa9tPFNuR3z_ADhOfA_XeH4oHUx";
const headers = { apikey: key, "Content-Type": "application/json" };
const checks = [];
async function request(path, options = {}) {
  return fetch(base + path, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(15000) });
}
let response = await request("/rest/v1/rpc/published_catalogue", { method: "POST", body: "{}" });
assert.equal(response.status, 200, "Published catalogue RPC must be available");
const offers = await response.json();
assert.ok(Array.isArray(offers), "Catalogue must be an array");
checks.push("Published catalogue RPC is reachable through the hosted Data API");

response = await request("/rest/v1/site_settings?select=company_name&limit=1");
assert.equal(response.status, 200);
assert.equal((await response.json()).length, 1);
checks.push("Shared public settings are readable");

response = await request("/rest/v1/services?select=id&limit=1");
assert.equal(response.status, 200);
assert.ok(Array.isArray(await response.json()));
checks.push("Published service records are readable");

response = await request("/rest/v1/contacts?select=id&limit=1");
assert.ok([401, 403].includes(response.status), "Anonymous contact reads must be denied");
checks.push("Anonymous CRM reads are denied by the hosted Data API");

response = await request("/rest/v1/marketing_offers?select=source_record&limit=1");
assert.ok([401, 403].includes(response.status), "Private supplier payload reads must be denied");
checks.push("Anonymous supplier payload reads are denied");

response = await request("/auth/v1/settings");
assert.equal(response.status, 200, "Hosted Auth must be reachable");
checks.push("Hosted Auth service is reachable without creating any account");

response = await request("/functions/v1/submit-enquiry");
assert.ok([403, 503].includes(response.status), "Originless enquiry request must fail closed");
const endpoint = await response.json();
assert.equal(typeof endpoint.error, "string");
checks.push("Deployed enquiry endpoint rejects unconfigured/originless requests");

response = await request("/functions/v1/staff-accounts", {method:"POST",body:"{}"});
assert.equal(response.status,401,"Anonymous users cannot create staff accounts");
checks.push("Hosted team-account endpoint denies anonymous creation");
response = await request("/functions/v1/initial-admin-setup",{method:"POST",body:"{}"});
assert.ok([401,410].includes(response.status),"One-time account setup is disabled");
checks.push("Initial account setup is disabled");
console.log(JSON.stringify({ hostedReadOnlyChecks: checks, publicOffers: offers.length, enquiryStatus: endpoint.error, writesPerformed: 0 }, null, 2));
