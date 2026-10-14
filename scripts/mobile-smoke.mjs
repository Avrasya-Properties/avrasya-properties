import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";

// These fixtures are served locally to SSR and browser reads. They never reach Supabase.
const origin = "http://127.0.0.1:8083",
  apiOrigin = "http://127.0.0.1:8084";
const base = {
  city: "Istanbul",
  side: "Europe",
  record_type: "unit_offer",
  mode: "sale",
  layout_label: "2+1",
  bathrooms: 2,
  tapu_status: "Ready to confirm",
  source_note: "Confirm the exact apartment before committing.",
  areas: [
    { value_m2: 112.37, basis: "gross" },
    { value_m2: 96, basis: "net" },
  ],
  source_ids: [],
  availability: "Available",
  availability_verified: true,
  cover: "/images/properties/orya-park-1.jpg",
};
const offer = {
  ...base,
  id: "00000000-0000-4000-8000-000000007001",
  ref: "MOBILE-01",
  slug: "mobile-test-apartment",
  marketing_title: "Mobile test apartment with a balcony and a longer property title",
  location_label: "Şişli — Feriköy",
  price: { amount: 420000, currency: "USD", basis: "fixed", status: "staff-published" },
  details: {
    project: "Mobile test development",
    note: "Approved property description.\nA separate second paragraph.",
    gallery_images: [
      "/images/properties/orya-park-1.jpg",
      "/images/properties/istanbul-project-43.jpg",
    ],
    floor_plan: "/images/properties/gunesli-floorplan.jpg",
    highlights: ["Approved balcony", "Confirmed apartment layout"],
    cbi_verified: false,
  },
};
const lira = {
  ...offer,
  id: "00000000-0000-4000-8000-000000007002",
  ref: "MOBILE-02",
  slug: "mobile-lira-apartment",
  marketing_title: "Mobile test apartment priced in Turkish lira",
  side: "Asia",
  location_label: "Ümraniye",
  price: { amount: 21000000, currency: "TRY", basis: "fixed", status: "staff-published" },
  details: { ...offer.details, floor_plan: null, gallery_images: [] },
};
let catalogueState = "published";
const settings = {
  singleton_key: "default",
  company_name: "Avrasya Properties",
  registered_entity: "Avrasya Properties",
  tagline: "Your Future Starts with the Right Investment.",
  hero_headline: "Find your place in Istanbul.",
  hero_subtitle: "Independent property advice across European and Asian Istanbul.",
  eyebrow_text: "Istanbul · Türkiye",
  email: "info@avrasyaproperties.com",
  phone: "+90 545 924 80 42",
  whatsapp: "https://wa.me/905459248042",
  address: "Üsküdar, Istanbul",
  advisory_hours: "By appointment",
  cbi_threshold_usd: 400000,
  exchange_rate_eur: 0.892,
  exchange_rate_try: 49.17,
  exchange_rate_gbp: 0.756,
  enable_frankfurter_sync: false,
  announcement_active: false,
  announcement_text: "",
  preloader_opacity: 0.5,
};
const adapter = Bun.serve({
  hostname: "127.0.0.1",
  port: 8084,
  fetch(request) {
    const path = new URL(request.url).pathname;
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (path === "/rest/v1/rpc/published_catalogue")
      return Response.json(
        catalogueState === "published"
          ? [offer, lira]
          : catalogueState === "error"
            ? { message: "Deliberate isolated test failure" }
            : [],
        { status: catalogueState === "error" ? 503 : 200, headers },
      );
    if (path === "/rest/v1/site_settings") return Response.json(settings, { headers });
    if (path === "/rest/v1/rpc/website_page" || path === "/rest/v1/rpc/published_redirect")
      return Response.json(null, { headers });
    if (["/rest/v1/services", "/rest/v1/faqs", "/rest/v1/catalog_documents"].includes(path))
      return Response.json([], { headers });
    return Response.json(
      { message: "Unsupported isolated test endpoint" },
      { status: 404, headers },
    );
  },
});
const child = spawn(
  process.env.AVRASYA_BUN || "bun",
  ["run", "dev", "--host", "127.0.0.1", "--port", "8083"],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, VITE_ENABLE_ADMIN_DEMO: "false", VITE_SUPABASE_URL: apiOrigin },
  },
);
let serverOutput = "",
  browser,
  page;
const pageErrors = [],
  results = [];
for (const stream of [child.stdout, child.stderr])
  stream.on("data", (c) => (serverOutput = (serverOutput + c).slice(-6000)));
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function visit(path) {
  await page.goto(origin + path, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("main h1");
  await page.waitForFunction(()=>document.documentElement.classList.contains("js-motion"));
  if (path.startsWith("/properties/")) await page.waitForSelector('[data-property-ready="true"]');
  await page.waitForFunction(
    () =>
      !document.querySelector(".avrasya-preloader") ||
      getComputedStyle(document.querySelector(".avrasya-preloader")).visibility === "hidden",
  );
}
async function fits(label) {
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    offenders: [...document.querySelectorAll("header *,main *,footer *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width > 0 &&
          (r.right > innerWidth + 2 || r.left < -2) &&
          !e.closest(".marquee,.outline-word,[data-parallax]")
        );
      })
      .slice(0, 15)
      .map((e) => ({ tag: e.tagName, class: e.className, text: e.textContent.slice(0, 80) })),
  }));
  assert.ok(
    metrics.document <= metrics.width + 1 && metrics.body <= metrics.width + 1,
    label + " overflows: " + JSON.stringify(metrics),
  );
  const headings = await page.$$eval("main h1,main h2", (elements) =>
    elements.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent),
  );
  assert.deepEqual(headings, [], label + " has clipped headings");
}
async function scrollAll() {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) {
      scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 25));
    }
    scrollTo({ top: 0, behavior: "instant" });
  });
}
async function screenshot(name) {
  await mkdir("test-results/mobile", { recursive: true });
  await page.screenshot({
    path: "test-results/mobile/" + name + ".webp",
    type: "webp",
    quality: 75,
  });
}
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(origin + "/admin/login")).ok) break;
    } catch {}
    if (attempt === 59) throw new Error("App did not start: " + serverOutput);
    await pause(500);
  }
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    headless: true,
    pipe: true,
    args: process.env.AVRASYA_BROWSER_ARGS
      ? JSON.parse(process.env.AVRASYA_BROWSER_ARGS)
      : ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("avr_preloader_seen", "1");
    } catch {}
  });
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 844, isMobile: width < 768, hasTouch: width < 768 });
    for (const path of ["/", "/properties", "/properties/" + offer.slug, "/contact"]) {
      await visit(path);
      await scrollAll();
      await fits(width + "px " + path);
    }
    results.push(width + "px homepage, catalogue, property detail and contact fit the viewport");
  }
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: width < 768, hasTouch: width < 768 });
    for (const path of [
      "/about",
      "/services",
      "/why-turkiye",
      "/investment-in-turkiye",
      "/citizenship",
      "/investment-catalog",
      "/privacy-policy",
      "/terms",
      "/cookie-policy",
      "/investment-disclaimer",
    ]) {
      await visit(path);
      await scrollAll();
      await fits(width + "px " + path);
    }
  }
  results.push(
    "Company, services, investment, citizenship, brochure and legal pages fit small phones and tablets",
  );
  for (const [width, height] of [
    [320, 568],
    [844, 390],
  ]) {
    await page.setViewport({ width, height, isMobile: true, hasTouch: true });
    await visit("/");
    await fits("Small screen or landscape home");
    await page.click('[aria-label="Open menu"]');
    await page.waitForSelector("#mobile-nav");
    assert.equal(
      await page.$eval("#mobile-nav", (e) => e.getBoundingClientRect().bottom <= innerHeight + 1),
      true,
    );
    await page.click('[aria-label="Close menu"]');
    await visit("/properties/" + offer.slug);
    await fits("Small screen or landscape property");
  }
  results.push("Small-screen and landscape menus scroll within the available height");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await visit("/");
  await screenshot("home-390");
  assert.equal(await page.$eval("main h1", (e) => e.textContent), settings.hero_headline);
  assert.equal(await page.$('main input[autocomplete="name"]'), null);
  await page.click('[aria-label="Open menu"]');
  await page.waitForSelector("#mobile-nav");
  assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
  assert.equal(await page.$eval('#mobile-nav a[href="/"]', (e) => e.textContent.trim()), "Home");
  await fits("Open mobile menu");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.getElementById("mobile-nav"));
  assert.equal(
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
    "Open menu",
  );
  assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
  results.push(
    "Mobile navigation includes Home, closes with Escape and restores scrolling and focus",
  );
  await visit("/properties");
  await page.click('button[aria-controls="catalogue-filters"]');
  await page.waitForSelector("#catalogue-filters", { visible: true });
  await fits("Expanded mobile filters");
  await page.type('input[type="search"]', "nothing matches");
  await page.waitForFunction(() =>
    document.body.textContent.includes("No listings match your filters."),
  );
  await page.click('a[href="/properties"].underline');
  await page.waitForFunction(() => document.querySelector('input[type="search"]').value === "");
  results.push(
    "Mobile filters expand, keyword filtering works and reset clears the visible search field",
  );
  await page.click('button[title="List View"]');
  await fits("Mobile list view");
  assert.equal(
    await page.evaluate(
      (title) => document.body.textContent.includes(title),
      offer.marketing_title,
    ),
    true,
  );
  results.push("Grid/list switch keeps complete property titles and saved data");
  await visit("/properties/" + offer.slug);
  await screenshot("property-390");
  const text = await page.$eval("[data-property-detail]", (e) => e.textContent);
  assert.ok(
    text.includes("112.37 m²") &&
      text.includes("96 m²") &&
      text.includes("Approved property description.") &&
      text.includes("MOBILE-01"),
  );
  assert.equal(text.includes("Miele / Gaggenau"), false);
  await page.click('button[title="Save to shortlist"]');
  await page.click('header a[aria-label^="Saved properties"]');
  await page.waitForFunction(() => location.search.includes("savedOnly=true"));
  assert.equal(await page.$$eval("main article", (els) => els.length), 1);
  results.push(
    "Correct gross/net areas, description and reference; saved-property navigation filters the catalogue",
  );
  await visit("/properties/" + offer.slug);
  await page.$eval('button[aria-label="View photo 2"]', (e) =>
    e.scrollIntoView({ block: "center", inline: "center", behavior: "instant" }),
  );
  await page.click('button[aria-label="View photo 2"]');
  await page.waitForFunction(
    () =>
      document.querySelector("[data-property-detail] section img")?.getAttribute("src") ===
      "/images/properties/istanbul-project-43.jpg",
  );
  await page.evaluate(() => scrollTo(0, 0));
  const expand = await page.$$("button");
  for (const button of expand)
    if (await button.evaluate((e) => e.textContent.includes("Fullscreen View"))) {
      await button.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
      await button.click();
      break;
    }
  await page.waitForSelector('[role="dialog"][aria-label="Property photo gallery"]');
  assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => !document.querySelector('[role="dialog"][aria-label="Property photo gallery"]'),
  );
  assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
  await page.click('.property-contact-bar a[href="#property-enquiry"]');
  await page.waitForFunction(
    () => document.getElementById("property-enquiry").getBoundingClientRect().top < 150,
  );
  assert.equal(
    await page.$$eval("main input:not([type='checkbox']),main select,main textarea", (els) =>
      els
        .filter((e) => getComputedStyle(e).display !== "none")
        .every((e) => parseFloat(getComputedStyle(e).fontSize) >= 16),
    ),
    true,
  );
  results.push(
    "Gallery photos switch, fullscreen keyboard controls close cleanly, enquiry shortcut and readable inputs work",
  );
  await visit("/properties/" + lira.slug);
  assert.equal(
    await page.$eval("[data-property-detail]", (e) => /TRY\s21,000,000/.test(e.textContent)),
    true,
  );
  await fits("Native TRY price");
  results.push("Unconverted TRY prices remain in their recorded currency");
  catalogueState = "empty";
  await visit("/");
  await page.waitForSelector("[data-empty-collection]");
  await fits("Empty catalogue homepage");
  assert.ok(await page.$("[data-home-hero]"));
  assert.ok(await page.$('main a[href="/calculator"]'),"The full homepage retains its calculator link");
  assert.equal(await page.$('main input[autocomplete="name"]'), null);
  await screenshot("home-empty-390");
  results.push(
    "Zero published properties retains the full homepage and a local empty-collection message",
  );
  catalogueState = "error";
  await visit("/");
  await page.waitForSelector('[data-home-collection] [role="alert"]');
  assert.ok(await page.$("[data-home-hero]"));
  await fits("Catalogue error homepage");
  results.push("Catalogue errors preserve the homepage and show a retry in the property section");
  catalogueState = "published";
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await visit("/");
  await scrollAll();
  await page.waitForFunction(()=>[...document.querySelectorAll("main [data-reveal]")].filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).every(e=>e.classList.contains("is-in")),{timeout:5000,polling:"mutation"});
  results.push("Scroll effects reveal asynchronously loaded sections");
  assert.deepEqual(pageErrors, []);
  await writeFile(
    "test-results/mobile/results.json",
    JSON.stringify({ mobileChecks: results }, null, 2),
  );
  console.log(JSON.stringify({ mobileChecks: results }, null, 2));
} catch (error) {
  await mkdir("test-results/mobile", { recursive: true });
  await page
    ?.screenshot({ path: "test-results/mobile/failure.png", fullPage: true })
    .catch(() => {});
  console.error(error.stack);
  console.error("Passed:", results);
  console.error("Page errors:", pageErrors);
  console.error("Server:", serverOutput);
  if (page)
    console.error(
      "Page:",
      page.url(),
      await page
        .evaluate(() => ({
          body: document.body.innerText.slice(0, 1800),
          images: [...document.querySelectorAll("[data-property-detail] section img")].map((x) =>
            x.getAttribute("src"),
          ),
          photos: [...document.querySelectorAll("[data-property-detail] button[aria-pressed]")].map(
            (x) => ({
              label: x.getAttribute("aria-label"),
              pressed: x.getAttribute("aria-pressed"),
            }),
          ),
        }))
        .catch(() => ""),
    );
  process.exitCode = 1;
} finally {
  await browser?.close();
  child.kill("SIGTERM");
  adapter.stop(true);
}
