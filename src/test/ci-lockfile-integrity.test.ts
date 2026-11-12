import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = resolve(__dirname, "../..");

describe("CI & Deployment Pipeline Integrity (GitHub Actions + Cloudflare)", () => {
  it("keeps package.json dependencies and devDependencies 100% synchronized with bun.lock workspaces['']", () => {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8"));
    const lockText = readFileSync(resolve(rootDir, "bun.lock"), "utf8");
    // bun.lock uses JSONC (trailing commas); strip trailing commas before parsing
    const normalizedLock = lockText.replace(/,(\s*[}\]])/g, "$1");
    const lock = JSON.parse(normalizedLock);

    const workspaceRoot = lock.workspaces?.[""];
    expect(workspaceRoot).toBeDefined();

    expect(pkg.dependencies).toEqual(workspaceRoot.dependencies);
    expect(pkg.devDependencies).toEqual(workspaceRoot.devDependencies);
  });

  it("does not include unused React-18 peer-conflicting @react-three packages in package.json", () => {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8"));
    expect(pkg.dependencies["@react-three/drei"]).toBeUndefined();
    expect(pkg.dependencies["@react-three/fiber"]).toBeUndefined();
  });

  it("extracts projectKey in scripts/enquiry-endpoint-check.mjs regardless of Prettier spacing", () => {
    const scriptSource = readFileSync(
      resolve(rootDir, "scripts/enquiry-endpoint-check.mjs"),
      "utf8",
    );
    const fnSource = readFileSync(
      resolve(rootDir, "supabase/functions/submit-enquiry/index.ts"),
      "utf8",
    );

    const regexLineMatch = scriptSource.match(/source\.match\(\/(.*)\/\)\[1\]/);
    expect(regexLineMatch).not.toBeNull();
    const pattern = new RegExp(regexLineMatch![1]!);

    const extracted = fnSource.match(pattern);
    expect(extracted).not.toBeNull();
    expect(JSON.parse(extracted![1]!)).toMatch(/^sb_publishable_/);
  });

  it("preserves gallery_images, floor_plan, and non-text highlights guards in latest save_offer migration", () => {
    const migration = readFileSync(
      resolve(
        rootDir,
        "supabase/migrations/20261112000001_complete_real_estate_inventory_system.sql",
      ),
      "utf8",
    );

    expect(migration).toContain("Use valid image links");
    expect(migration).toContain("Use a valid floor plan image link");
    expect(migration).toContain("Use text highlights under 300 characters");
  });

  it("preserves homepage CI smoke selectors ([data-home-collection], [data-empty-collection], /calculator link, and collectionHeading)", () => {
    const indexRoute = readFileSync(resolve(rootDir, "src/routes/index.tsx"), "utf8");
    const showcase = readFileSync(
      resolve(rootDir, "src/components/site/BildoraProjectsShowcase.tsx"),
      "utf8",
    );

    expect(indexRoute).toContain("data-home-collection");
    expect(indexRoute).toContain("data-empty-collection");
    expect(indexRoute + showcase).toContain("/calculator");
    expect(indexRoute + showcase).toContain("collectionHeading");
  });
});
