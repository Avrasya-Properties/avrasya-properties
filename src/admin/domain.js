// Pure business invariants shared by the demo repository and its regression tests.
export function requireText(value, label, max = 2000) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(label + " is required and must be at most " + max + " characters.");
  return value.trim();
}
export function requireEnum(value, values, label) {
  if (!values.includes(value)) throw new Error("Invalid " + label + ".");
  return value;
}
export function requireAmount(value, label, allowNull = true) {
  if (value === null && allowNull) return;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(label + " must be a finite, non-negative number.");
}
export function requireDate(value, label) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new Error("Invalid " + label + ".");
}
export function contactMatch(a, b) {
  const email = (v) => typeof v === "string" ? v.trim().toLowerCase() : "";
  const phone = (v) => typeof v === "string" ? v.replace(/\D/g, "") : "";
  return Boolean((email(a.email) && email(a.email) === email(b.email)) || (phone(a.phone) && phone(a.phone) === phone(b.phone)));
}
export function exactBudget(text) {
  // Free-text ranges, suffixes and ambiguous currencies stay in notes.
  const s = typeof text === "string" ? text.trim() : "";
  const m = s.match(/^(USD|EUR|TRY|GBP|\$|€|₺|£)\s*(\d+(?:,\d{3})*)(?:\.(\d{1,2}))?$/i);
  if (!m) return null;
  const currency = ({ "$": "USD", "€": "EUR", "₺": "TRY", "£": "GBP" })[m[1]] || m[1].toUpperCase();
  const amount = Number(m[2].replace(/,/g, "") + (m[3] ? "." + m[3] : ""));
  return Number.isFinite(amount) ? { amount, currency } : null;
}
export function validateSettings(s) {
  if(s.websiteDesign!==undefined){if(!s.websiteDesign||typeof s.websiteDesign!=="object"||Array.isArray(s.websiteDesign))throw new Error("Invalid website appearance settings");for(const [key,value] of Object.entries(s.websiteDesign)){if(typeof value!=="string"||value.length>4000)throw new Error("Invalid website appearance text");if(["logoDark","logoLight","heroMain","heroAlt","footerImage"].includes(key)&&value!==""&&!/^(https:\/\/|\/images\/)[^\s]+$/.test(value))throw new Error("Use an HTTPS image link or an existing website image");}}
  const textKeys = ["companyName", "registeredEntity", "taxOffice", "licenseNo", "tagline", "email", "phone", "whatsapp", "address", "advisoryHours", "heroHeadline", "heroSubtitle", "eyebrowText", "announcementText"];
  for (const k of textKeys) if (typeof s[k] !== "string" || s[k].length > 4000) throw new Error("Invalid setting: " + k);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) throw new Error("Enter a valid contact email.");
  let url; try { url = new URL(s.whatsapp); } catch { throw new Error("Enter a valid WhatsApp URL."); }
  if (url.protocol !== "https:" || !["wa.me", "api.whatsapp.com"].includes(url.hostname)) throw new Error("WhatsApp URL must use https://wa.me or https://api.whatsapp.com.");
  for (const k of ["cbiThresholdUsd", "exchangeRateEur", "exchangeRateTry", "exchangeRateGbp"]) {
    requireAmount(s[k], k, false);
    if (s[k] <= 0) throw new Error(k + " must be positive.");
  }
  requireAmount(s.preloaderOpacity, "preloaderOpacity", false);
  if (s.preloaderOpacity > 1) throw new Error("Preloader opacity must be between zero and one.");
  if (typeof s.announcementActive !== "boolean" || typeof s.enableFrankfurterSync !== "boolean") throw new Error("Invalid settings flags.");
  if (s.indexingEnabled !== undefined && typeof s.indexingEnabled !== "boolean") throw new Error("Invalid indexing flag.");
  if (s.districts !== undefined && (!Array.isArray(s.districts) || s.districts.some((x) => typeof x !== "string"))) throw new Error("Invalid districts list.");
  if (s.regions !== undefined) {
    if (!Array.isArray(s.regions) || s.regions.length > 50) throw new Error("Use up to 50 regions.");
    const slugs = new Set();
    for (const r of s.regions) {
      if (!r || typeof r !== "object" || typeof r.name !== "string" || !r.name.trim() || r.name.length > 80) throw new Error("Each region needs a name under 80 characters.");
      if (typeof r.slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug) || r.slug.length > 60) throw new Error("Region \"" + r.name + "\" needs a web address using lowercase letters, numbers and hyphens.");
      if (slugs.has(r.slug)) throw new Error("Two regions use the web address \"" + r.slug + "\".");
      slugs.add(r.slug);
      if (!Array.isArray(r.districts) || r.districts.length > 200 || r.districts.some((d) => typeof d !== "string" || !d.trim() || d.length > 80)) throw new Error("Check the districts of " + r.name + ".");
      if (typeof r.summary !== "string" || r.summary.length > 1000) throw new Error("The summary of " + r.name + " is too long.");
      if (typeof r.heroImage !== "string" || (r.heroImage !== "" && !/^(https:\/\/|\/images\/)[^\s]+$/.test(r.heroImage))) throw new Error("Use an HTTPS image link or an existing website image for " + r.name + ".");
      if (typeof r.seoTitle !== "string" || r.seoTitle.length > 120 || typeof r.seoDescription !== "string" || r.seoDescription.length > 320) throw new Error("Search title or summary of " + r.name + " is too long.");
      if (typeof r.hasSides !== "boolean" || typeof r.published !== "boolean" || !Number.isFinite(r.sortOrder)) throw new Error("Invalid settings for region " + r.name + ".");
    }
  }
  if (s.layouts !== undefined && (!Array.isArray(s.layouts) || s.layouts.some((x) => typeof x !== "string"))) throw new Error("Invalid layouts list.");
  if (s.budgetRanges !== undefined && (!Array.isArray(s.budgetRanges) || s.budgetRanges.some((b) => !b || typeof b !== "object" || typeof b.id !== "string" || typeof b.label !== "string"))) throw new Error("Invalid budget ranges list.");
  if(s.budgetRanges){const ids=new Set();for(const b of s.budgetRanges){if(!b.id.trim()||ids.has(b.id)||!b.label.trim()||!Number.isFinite(b.min)||!Number.isFinite(b.max)||b.min<0||b.max<=b.min)throw new Error("Each budget tier needs a unique name and a valid lower and upper amount.");ids.add(b.id);}}
  return s;
}
export function validateWorkspace(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Backup must be an object.");
  const wrapped = Object.hasOwn(input, "schemaVersion");
  if (wrapped && input.schemaVersion !== 1) throw new Error("Unsupported backup schema version.");
  const d = wrapped ? input.data : input;
  if (!d || typeof d !== "object") throw new Error("Missing workspace data.");
  const cols = ["properties", "contacts", "leads", "tasks", "viewings", "deals", "inquiries", "activity", "readNotes"];
  for (const c of cols) if (!Array.isArray(d[c])) throw new Error("Missing or invalid " + c + " array.");
  const ids = {};
  for (const c of cols.filter((c) => c !== "readNotes")) {
    ids[c] = new Set();
    for (const r of d[c]) {
      if (!r || typeof r !== "object") throw new Error("Invalid record in " + c);
      requireText(r.id, c + " ID", 100);
      if (ids[c].has(r.id)) throw new Error("Duplicate ID in " + c + ": " + r.id);
      ids[c].add(r.id);
    }
  }
  const ref = (c, id) => { if (!ids[c].has(id)) throw new Error("Broken " + c + " reference: " + id); };
  const string = (r, keys) => { for (const k of keys) if (typeof r[k] !== "string") throw new Error("Invalid " + k + " in " + r.id); };
  const currencies = ["USD", "EUR", "TRY", "GBP"];
  const slugs = new Set(), refs = new Set();
  for (const p of d.properties) {
    string(p, ["ref", "slug", "title", "district", "city", "type", "agentId", "description", "project"]);
    if (!p.slug || slugs.has(p.slug) || refs.has(p.ref)) throw new Error("Duplicate or missing property slug/reference.");
    slugs.add(p.slug); refs.add(p.ref);
    requireEnum(p.availability, ["Unknown", "Available", "Under Offer", "Reserved", "Sold", "Rented", "Off Market"], "availability");
    requireEnum(p.publication, ["Draft", "In Review", "Published", "Archived"], "publication");
    requireEnum(p.mode, ["sale", "rent"], "property mode");
    requireEnum(p.priceType, ["fixed", "from", "on-request"], "price type");
    if (p.currency !== null) requireEnum(p.currency, currencies, "currency");
    for (const k of ["amount", "bathrooms", "grossM2", "netM2", "areaM2"]) requireAmount(p[k], k);
    if (p.layout !== null && typeof p.layout !== "string") throw new Error("Invalid layout.");
    if (p.cover !== null && typeof p.cover !== "string") throw new Error("Invalid cover.");
    requireDate(p.updatedAt, "property timestamp");
  }
  for (const c of d.contacts) {
    string(c, ["name", "email", "phone", "language", "agentId", "notes"]);
    requireEnum(c.kind, ["person", "company"], "contact kind");
    if (!Array.isArray(c.roles) || c.roles.some((x) => typeof x !== "string")) throw new Error("Invalid contact roles.");
  }
  for (const l of d.leads) {
    ref("contacts", l.contactId); string(l, ["source", "agentId", "districts", "layout"]);
    requireEnum(l.stage, ["New", "Contacted", "Qualified", "Viewing", "Negotiation", "Converted", "Lost", "On Hold"], "lead stage");
    requireEnum(l.currency, currencies, "lead currency");
    requireAmount(l.budgetMin, "minimum budget"); requireAmount(l.budgetMax, "maximum budget");
    if (l.budgetMin !== null && l.budgetMax !== null && l.budgetMin > l.budgetMax) throw new Error("Minimum budget exceeds maximum.");
    if (l.nextFollowUp !== null) requireDate(l.nextFollowUp, "follow-up");
    if (!Array.isArray(l.shortlist)) throw new Error("Invalid shortlist.");
    l.shortlist.forEach((id) => ref("properties", id));
    if (l.dealId) ref("deals", l.dealId);
    if (l.stage === "Lost") requireText(l.lossReason, "Loss reason");
  }
  for (const t of d.tasks) {
    string(t, ["title", "assigneeId"]); requireDate(t.due, "task date");
    requireEnum(t.priority, ["Low", "Normal", "High"], "task priority");
    if (typeof t.done !== "boolean") throw new Error("Invalid task completion.");
  }
  for (const v of d.viewings) {
    ref("contacts", v.contactId); ref("properties", v.propertyId); string(v, ["agentId", "notes"]);
    requireDate(v.start, "viewing start"); requireDate(v.end, "viewing end");
    if (Date.parse(v.end) <= Date.parse(v.start)) throw new Error("Viewing end must follow its start.");
    requireEnum(v.status, ["Scheduled", "Confirmed", "Completed", "Cancelled", "No-show"], "viewing status");
  }
  for (const x of d.deals) {
    ref("contacts", x.contactId); string(x, ["title", "agentId"]);
    if (x.leadId) ref("leads", x.leadId);
    requireEnum(x.stage, ["Opportunity", "Offer Prepared", "Offer Accepted", "Reserved", "Due Diligence", "Contract", "Won", "Lost"], "deal stage");
    requireEnum(x.currency, currencies, "deal currency"); requireAmount(x.amount, "deal amount");
    if (!Array.isArray(x.propertyIds)) throw new Error("Invalid deal units.");
    x.propertyIds.forEach((id) => ref("properties", id));
    if (x.expectedClose !== null) requireDate(x.expectedClose, "expected close");
  }
  for (const q of d.inquiries) {
    string(q, ["name", "email", "phone", "topic", "budget", "message", "source"]);
    requireEnum(q.status, ["New", "Contacted", "Qualified", "Archived"], "inquiry status");
    requireDate(q.createdAt, "inquiry timestamp");
    if (q.leadId) ref("leads", q.leadId);
  }
  for (const a of d.activity) { string(a, ["kind", "text", "userId"]); requireDate(a.at, "activity timestamp"); }
  if (d.readNotes.some((x) => typeof x !== "string")) throw new Error("Invalid notification state.");
  validateSettings(d.siteSettings);
  return d;
}
export function validateDealSelection(deal, properties, otherDeals) {
  if (!Array.isArray(deal.propertyIds) || !deal.propertyIds.length) throw new Error("Select the units being purchased before completing this deal.");
  if (new Set(deal.propertyIds).size !== deal.propertyIds.length) throw new Error("Duplicate units in deal.");
  requireAmount(deal.amount, "Agreed deal amount", false);
  if (deal.amount <= 0) throw new Error("Enter a positive agreed deal amount.");
  const selected = deal.propertyIds.map((id) => {
    const p = properties.find((x) => x.id === id);
    if (!p) throw new Error("Selected property no longer exists.");
    if (p.type !== "unit offer" || p.sourceNote) throw new Error("Resolve the physical unit identity and source review before completing this transaction.");
    if (!["Available", "Under Offer", "Reserved"].includes(p.availability)) throw new Error(p.ref + " is not available for this transaction.");
    if (otherDeals.some((x) => x.id !== deal.id && ["Reserved", "Due Diligence", "Contract", "Won"].includes(x.stage) && x.propertyIds.includes(id))) throw new Error(p.ref + " belongs to another active transaction.");
    return p;
  });
  return selected;
}

export function istanbulDateTime(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Enter a valid Istanbul date and time.");
  const date = new Date(value + ":00+03:00");
  if (!Number.isFinite(date.getTime())) throw new Error("Enter a valid Istanbul date and time.");
  const local = new Date(date.getTime() + 3 * 3600000).toISOString().slice(0, 16);
  if (local !== value) throw new Error("This calendar date does not exist.");
  return date.toISOString();
}

export function currencyTotals(records) {
  const totals = {};
  for (const record of records) {
    if (!["USD", "EUR", "TRY", "GBP"].includes(record.currency) || typeof record.amount !== "number" || !Number.isFinite(record.amount) || record.amount < 0) continue;
    totals[record.currency] = (totals[record.currency] || 0) + record.amount;
  }
  return totals;
}

