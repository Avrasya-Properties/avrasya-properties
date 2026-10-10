import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const origin = "http://127.0.0.1:8080";
const child = spawn("bun", ["run", "dev", "--host", "127.0.0.1", "--port", "8080"], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, VITE_ENABLE_ADMIN_DEMO: "true" } });
let serverOutput = "";
child.stdout.on("data", (chunk) => { serverOutput = (serverOutput + chunk).slice(-8000); });
child.stderr.on("data", (chunk) => { serverOutput = (serverOutput + chunk).slice(-8000); });
let browser;
let page;
const pageErrors = [];
const results = [];

async function clickText(text, root = "body") {
  await page.waitForFunction((text, root) => [...document.querySelectorAll(root + " button")].some((button) => button.textContent.trim() === text && !button.disabled), {}, text, root);
  const handles = await page.$$(root + " button");
  for (const handle of handles) {
    const matches = await handle.evaluate((button, wanted) => button.textContent.trim() === wanted && !button.disabled, text);
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
    if (await label.evaluate((element, text) => element.textContent.trim() === text, labelText)) {
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
  await page.goto(origin + path, { waitUntil: "domcontentloaded" });
  await page.waitForFunction((text) => [...document.querySelectorAll("h1")].some((element) => element.textContent.trim() === text), {}, heading);
}
async function readWorkspace() {
  return page.evaluate(() => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")));
}
async function waitSaved(collection, field, value) {
  await page.waitForFunction((collection, field, value) => {
    const data = JSON.parse(localStorage.getItem("avrasya-admin-db-v4") || "{}");
    return data[collection]?.some((record) => record[field] === value);
  }, {}, collection, field, value);
}
async function login(role) {
  await page.goto(origin + "/admin/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('form[data-ready="true"]');
  await fill('input[type="email"]', role + "@avrasya.test");
  await fill('input[type="password"]', "AvrasyaDemo!26");
  await clickText("Sign in");
  await page.waitForSelector('a[href="/admin/settings"]');
}

try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(origin + "/admin/login")).ok) break; } catch {}
    if (child.exitCode !== null) throw new Error("Dev server exited: " + serverOutput);
    if (attempt === 59) throw new Error("Dev server failed to become ready: " + serverOutput);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  page.setDefaultTimeout(20000);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await login("admin");
  results.push("Admin sign-in and navigation");

  await visit("/admin/contacts", "Contacts");
  await clickText("Add contact");
  await fillLabel("Name", "Smoke Test Contact");
  await fillLabel("Email", "smoke-contact@example.test");
  await clickText("Save contact");
  await waitSaved("contacts", "name", "Smoke Test Contact");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.textContent.includes("Smoke Test Contact"));
  results.push("Contact creation persists across page reload");

  await visit("/admin/properties", "Properties");
  await clickText("New property");
  await page.waitForSelector('input[placeholder="Unknown"]');
  await fillLabel("Title", "Smoke Test Unit");
  await fillLabel("District", "Test District");
  await selectLabel("Availability", "Available");
  await clickText("Save changes");
  await waitSaved("properties", "title", "Smoke Test Unit");
  await clickText("Pricing");
  await fillLabel("Amount", "420000");
  await clickText("Save changes");
  await clickText("Media");
  await clickText("Bosphorus Hero");
  await clickText("Save changes");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")).properties.some((property) => property.title === "Smoke Test Unit" && property.cover && property.amount === 420000));
  results.push("Property details, price and cover editing");

  await visit("/admin/inquiries", "Consultations & Inquiries");
  await clickText("Log Client Inquiry");
  await page.waitForSelector("form textarea");
  const inputs = await page.$$("form input");
  await inputs[0].type("Smoke Test Buyer");
  await inputs[1].type("smoke-buyer@example.test");
  await page.type("form textarea", "Please advise on this test unit.");
  await clickText("Save to Inbox");
  await waitSaved("inquiries", "name", "Smoke Test Buyer");
  const row = await page.$$("tbody tr");
  for (const element of row) {
    if (await element.evaluate((node) => node.textContent.includes("Smoke Test Buyer"))) { await element.click(); break; }
  }
  await clickText("Convert to CRM Lead");
  await page.waitForFunction(() => location.pathname.startsWith("/admin/leads/"));
  await clickText("Convert to deal");
  await page.waitForFunction(() => location.pathname === "/admin/deals");
  let data = await readWorkspace();
  const buyer = data.contacts.find((contact) => contact.name === "Smoke Test Buyer");
  let deal = data.deals.find((record) => record.contactId === buyer.id);
  assert.deepEqual(deal.propertyIds, [], "Converted lead must not purchase the shortlist");
  results.push("Inquiry conversion and empty initial purchase selection");

  await clickText("Edit details");
  await page.waitForSelector('[role="dialog"] input[type="number"]');
  await fill('[role="dialog"] input[type="number"]', "420000");
  const labels = await page.$$('[role="dialog"] label');
  for (const label of labels) {
    if (await label.evaluate((element) => element.textContent.includes("Smoke Test Unit"))) {
      const checkbox = await label.$('input[type="checkbox"]');
      assert(checkbox); await checkbox.click(); break;
    }
  }
  await clickText("Save details");
  for (const stage of ["Offer Prepared", "Offer Accepted", "Reserved", "Due Diligence", "Contract"]) {
    await clickText("Move to " + stage);
    await waitSaved("deals", "stage", stage);
  }
  await clickText("Complete");
  await waitSaved("deals", "stage", "Won");
  data = await readWorkspace();
  const unit = data.properties.find((property) => property.title === "Smoke Test Unit");
  assert.equal(unit.availability, "Sold");
  deal = data.deals.find((record) => record.contactId === buyer.id);
  assert.deepEqual(deal.propertyIds, [unit.id]);
  results.push("Explicit unit agreement, reservation and sale completion");

  await visit("/admin/calendar", "Calendar");
  await page.$eval('input[type="datetime-local"]', (input) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "2026-12-20T10:00");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await clickText("Schedule viewing");
  await waitSaved("viewings", "start", "2026-12-20T07:00:00.000Z");
  results.push("Viewing creation uses Istanbul wall time");

  await visit("/admin/tasks", "Tasks");
  await fill('[aria-label="Task title"]', "Smoke Test Task");
  await page.$eval('input[type="datetime-local"]', (input) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "2026-12-20T10:00");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await clickText("Add task");
  await waitSaved("tasks", "title", "Smoke Test Task");
  const taskChecks = await page.$$('input[type="checkbox"]');
  for (const checkbox of taskChecks) {
    if (await checkbox.evaluate((input) => input.parentElement.textContent.includes("Smoke Test Task"))) { await checkbox.click(); break; }
  }
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")).tasks.some((task) => task.title === "Smoke Test Task" && task.done));
  results.push("Task creation and completion");

  for (const [path, heading] of [["/admin/projects", "Projects"], ["/admin/analytics", "Portfolio Analytics & Intelligence"]]) {
    await visit(path, heading);
  }
  results.push("Projects and analytics load");

  await visit("/admin/settings", "Website Content & CMS");
  await fillLabel("Brand Name", "Smoke Test Brand");
  await clickText("Save CMS Changes");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")).siteSettings.companyName === "Smoke Test Brand");
  results.push("CMS setting persistence");

  await page.click('[aria-label="Log out"]');
  await page.waitForSelector('input[type="email"]');
  await login("viewer");
  await visit("/admin/settings", "Website Content & CMS");
  assert.equal(await page.$eval("fieldset", (element) => element.disabled), true);
  const saveDisabled = await page.evaluate(() => [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Save CMS Changes")?.disabled);
  assert.equal(saveDisabled, true);
  await clickText("Backup & Restore");
  const backupDisabled = await page.evaluate(() => [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Export JSON Backup")?.disabled);
  assert.equal(backupDisabled, true);
  results.push("Viewer cannot modify CMS or export backups");

  assert.deepEqual(pageErrors, [], "Unexpected browser page errors");
  console.log(JSON.stringify({ passed: results }, null, 2));
} catch (error) {
  await mkdir("test-results", { recursive: true });
  if (page) await page.screenshot({ path: "test-results/admin-smoke-failure.png", fullPage: true }).catch(() => {});
  console.error("Browser smoke failure:", error.message);
  console.error("Completed steps:", JSON.stringify(results));
  if (page) console.error("CMS diagnostics:", await page.evaluate(() => ({ draft: document.getElementById("cms-companyName")?.value, saved: JSON.parse(localStorage.getItem("avrasya-admin-db-v4") || "{}").siteSettings?.companyName, messages: [...document.querySelectorAll("[data-sonner-toast]")].map((toast) => toast.textContent) })).catch(() => ({})));
  console.error("Page errors:", JSON.stringify(pageErrors));
  if (page) console.error("Failure page:", page.url(), await page.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => ""));
  console.error(serverOutput);
  process.exitCode = 1;
} finally {
  await browser?.close();
  child.kill("SIGTERM");
}
