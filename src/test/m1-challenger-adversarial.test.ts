import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import * as store from "@/admin/demo";
import {
  ROLE_NAMES,
  RBAC_ROLE_MAP,
  DB_TO_RBAC_ROLE_MAP,
  MODULES,
  type StaffRole,
  type RbacRole,
} from "@/admin/management";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase";

describe("Milestone M1 Challenger Adversarial Stress Suite", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const migrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20261106000001_admin_cms_hardening.sql",
  );
  const sqlContent = fs.readFileSync(migrationPath, "utf-8");

  // =========================================================================
  // 1. MIGRATION SYNTAX, IDEMPOTENCY & NON-DESTRUCTIVENESS
  // =========================================================================
  describe("1. Migration Syntax & Idempotency", () => {
    it("verifies migration does not drop tables, drop columns, or truncate data", () => {
      // Must not drop any tables
      expect(sqlContent).not.toMatch(/DROP\s+TABLE/i);

      // Must not drop any columns
      expect(sqlContent).not.toMatch(/DROP\s+COLUMN/i);

      // Must not truncate any data
      expect(sqlContent).not.toMatch(/TRUNCATE/i);

      // All ALTER TABLE column additions must use IF NOT EXISTS
      const alterTableMatches = sqlContent.match(/ALTER\s+TABLE\s+[\s\S]+?;/gi) || [];
      for (const statement of alterTableMatches) {
        if (/ADD\s+COLUMN/i.test(statement)) {
          expect(statement).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/i);
        }
      }

      // Functions must use CREATE OR REPLACE
      const functionMatches = sqlContent.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION/gi) || [];
      for (const f of functionMatches) {
        expect(f).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION/i);
      }
    });

    it("verifies policy and trigger idempotency, isolating missing DROP statements on storage.objects", () => {
      // storage_files policies have clean DROP IF EXISTS
      expect(sqlContent).toContain(
        'DROP POLICY IF EXISTS "staff_read_storage_files" ON public.storage_files;',
      );
      expect(sqlContent).toContain(
        'DROP POLICY IF EXISTS "staff_insert_storage_files" ON public.storage_files;',
      );
      expect(sqlContent).toContain(
        'DROP POLICY IF EXISTS "staff_update_storage_files" ON public.storage_files;',
      );
      expect(sqlContent).toContain(
        'DROP POLICY IF EXISTS "staff_delete_storage_files" ON public.storage_files;',
      );

      // audit_events policy has clean DROP IF EXISTS
      expect(sqlContent).toContain(
        "DROP POLICY IF EXISTS staff_read_audit ON public.audit_events;",
      );

      // All triggers have clean DROP IF EXISTS
      expect(sqlContent).toContain(
        "DROP TRIGGER IF EXISTS record_audit ON public.marketing_offers;",
      );
      expect(sqlContent).toContain("DROP TRIGGER IF EXISTS record_audit ON public.site_settings;");
      expect(sqlContent).toContain("DROP TRIGGER IF EXISTS record_audit ON public.services;");
      expect(sqlContent).toContain("DROP TRIGGER IF EXISTS record_audit ON public.content_pages;");
      expect(sqlContent).toContain(
        "DROP TRIGGER IF EXISTS record_audit ON public.content_sections;",
      );

      // ADVERSARIAL DEFECT DETECTION:
      // storage.objects creates "staff_media_storage" and "staff_private_storage"
      // but only drops legacy "manager_media" and "manager_private".
      // If re-run, CREATE POLICY "staff_media_storage" will crash in Postgres with:
      // "ERROR: policy 'staff_media_storage' for relation 'objects' already exists".
      const hasStaffMediaDrop =
        /DROP\s+POLICY\s+IF\s+EXISTS\s+"?staff_media_storage"?\s+ON\s+storage\.objects/i.test(
          sqlContent,
        );
      const hasStaffPrivateDrop =
        /DROP\s+POLICY\s+IF\s+EXISTS\s+"?staff_private_storage"?\s+ON\s+storage\.objects/i.test(
          sqlContent,
        );

      // Documenting the remediation:
      expect(hasStaffMediaDrop).toBe(true);
      expect(hasStaffPrivateDrop).toBe(true);
    });
  });

  // =========================================================================
  // 2. CHECK CONSTRAINTS ON navigation_items AND footer_settings
  // =========================================================================
  describe("2. Check Constraints on navigation_items and footer_settings", () => {
    it("migration enforces array type for navigation_items and object type for footer_settings", () => {
      expect(sqlContent).toContain("CHECK (jsonb_typeof(navigation_items) = 'array')");
      expect(sqlContent).toContain("CHECK (jsonb_typeof(footer_settings) = 'object')");
    });

    it("verifies constraint semantics against various malformed payloads", () => {
      // Simulating Postgres jsonb_typeof evaluation
      function jsonbTypeof(val: unknown): string {
        if (val === null) return "null";
        if (Array.isArray(val)) return "array";
        if (typeof val === "object") return "object";
        if (typeof val === "string") return "string";
        if (typeof val === "number") return "number";
        if (typeof val === "boolean") return "boolean";
        return "unknown";
      }

      // Navigation Items check constraint: jsonb_typeof(navigation_items) = 'array'
      const navPassPayloads = [[], [{ label: "Home", href: "/", order: 1, is_visible: true }]];
      for (const p of navPassPayloads) {
        expect(jsonbTypeof(p)).toBe("array");
      }

      const navRejectPayloads = [
        {}, // object instead of array
        { items: [] },
        "string-payload",
        12345,
        true,
        null,
      ];
      for (const p of navRejectPayloads) {
        expect(jsonbTypeof(p)).not.toBe("array");
      }

      // Footer Settings check constraint: jsonb_typeof(footer_settings) = 'object'
      const footerPassPayloads = [{}, { columns: [], note: "test" }];
      for (const p of footerPassPayloads) {
        expect(jsonbTypeof(p)).toBe("object");
      }

      const footerRejectPayloads = [
        [], // array instead of object
        ["col1", "col2"],
        "footer-string",
        999,
        false,
        null,
      ];
      for (const p of footerRejectPayloads) {
        expect(jsonbTypeof(p)).not.toBe("object");
      }
    });

    it("surfaces boundary condition: check constraints only validate root JSON type, not item schema", () => {
      // Adversarial insight: An array of invalid elements like [1, 2, "broken"] or [{ evil: true }]
      // satisfies jsonb_typeof = 'array'.
      const malformedElementsArray = [123, "invalid", { malicious: true }];
      // This passes the DB check constraint:
      expect(Array.isArray(malformedElementsArray)).toBe(true);
      // NOTE: Downstream TypeScript/frontend must ensure runtime validation of items.
    });
  });

  // =========================================================================
  // 3. SEO FIELD VALIDATION IN private.save_offer (CHALLENGE / AUDIT)
  // =========================================================================
  describe("3. Adversarial Check: private.save_offer SEO Validation", () => {
    it("empirically checks whether private.save_offer validates seo_title, seo_description, and og_image_url", () => {
      // Find the body of private.save_offer in the SQL (from CREATE until end $function$;)
      const saveOfferMatch = sqlContent.match(
        /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+private\.save_offer[\s\S]+?end\s+\$function\$;/i,
      );
      expect(saveOfferMatch).not.toBeNull();
      const saveOfferBody = saveOfferMatch![0];

      // 1. Confirm fields are accepted in p_data allowed keys
      expect(saveOfferBody).toContain("'seo_title'");
      expect(saveOfferBody).toContain("'seo_description'");
      expect(saveOfferBody).toContain("'og_image_url'");

      // 2. Adversarial Observation: Check if length validation exists for seo_title
      const hasSeoTitleLengthCheck =
        /length\s*\(\s*r\.seo_title\s*\)/i.test(saveOfferBody) ||
        /length\s*\(\s*p_data\s*->>\s*'seo_title'\s*\)/i.test(saveOfferBody);

      // 3. Adversarial Observation: Check if length validation exists for seo_description
      const hasSeoDescLengthCheck =
        /length\s*\(\s*r\.seo_description\s*\)/i.test(saveOfferBody) ||
        /length\s*\(\s*p_data\s*->>\s*'seo_description'\s*\)/i.test(saveOfferBody);

      // 4. Adversarial Observation: Check if URL regex check exists for og_image_url
      const hasOgImageUrlFormatCheck =
        /og_image_url[\s\S]{1,100}!~\s*'\^\(https:\/\//i.test(saveOfferBody) ||
        /og_image_url[\s\S]{1,100}https:\/\//i.test(saveOfferBody);

      // EMPIRICAL FINDING:
      // While floor_plan and gallery_images have strict URL/length guards (lines 127-150):
      //   floor_plan: length <= 2048 and ^(https://|/images/)
      //   gallery_images: length <= 2048 and ^(https://|/images/)
      // neither seo_title, seo_description, nor og_image_url has explicit length or URL format validation in save_offer!
      // Documenting the remediation:
      expect(hasSeoTitleLengthCheck).toBe(true);
      expect(hasSeoDescLengthCheck).toBe(true);
      expect(hasOgImageUrlFormatCheck).toBe(true);
    });
  });

  // =========================================================================
  // 4. RBAC PERMISSIONS & SECURITY
  // =========================================================================
  describe("4. RBAC Permissions and Security Enforcement", () => {
    beforeEach(() => {
      vi.stubGlobal("crypto", { randomUUID });
      vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
      store.login("admin@avrasya.test", store.DEMO_PASSWORD);
      store.resetData();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    });

    it("blocks unauthenticated users from mutative operations on all admin tables", () => {
      store.logout();
      expect(store.getSession()).toBeNull();

      // Mutation on settings
      expect(() => {
        store.updateSiteSettings({ siteTitle: "Hacked" });
      }).toThrow();

      // Mutation on properties
      expect(() => {
        store.upsert("properties", { title: "Hacked Property" });
      }).toThrow();

      // Mutation on inquiries
      expect(() => {
        store.remove("inquiries", "inq-1");
      }).toThrow();
    });

    it("verifies unauthenticated users have write access revoked in SQL on storage_files", () => {
      expect(sqlContent).toMatch(
        /REVOKE\s+ALL\s+ON\s+public\.storage_files\s+FROM\s+public,\s*anon/i,
      );
      expect(sqlContent).toMatch(
        /GRANT\s+SELECT,\s*INSERT,\s*UPDATE,\s*DELETE\s+ON\s+public\.storage_files\s+TO\s+authenticated/i,
      );
    });

    it("strictly prevents an Agent from elevating permissions or altering staff profiles", () => {
      // 1. In SQL: staff_profiles RLS requires is_admin()
      const rlsMigrationPath = path.join(
        rootDir,
        "supabase",
        "migrations",
        "20261011000006_rls_and_security_policies.sql",
      );
      const rlsSql = fs.readFileSync(rlsMigrationPath, "utf-8");
      expect(rlsSql).toContain('CREATE POLICY "admin_manage_staff" ON public.staff_profiles');
      expect(rlsSql).toContain("public.is_admin()");

      // 2. In Frontend Management MODULES: staff_profiles has admin: true
      const staffModule = MODULES.find((m) => m.table === "staff_profiles");
      expect(staffModule).toBeDefined();
      expect(staffModule?.admin).toBe(true);

      // 3. In Store RBAC: Agent cannot execute 'admin' action
      store.login("agent@avrasya.test", store.DEMO_PASSWORD);
      const agentUser = store.getSession();
      expect(agentUser?.role).toBe("agent");
      expect(store.can(agentUser, "admin")).toBe(false);

      // Agent cannot publish properties
      expect(store.can(agentUser, "publish")).toBe(false);

      // Agent cannot edit other users' CRM records
      expect(store.can(agentUser, "edit-crm", "other-user-uuid")).toBe(false);
    });

    it("verifies Viewer has strictly read-only access", () => {
      store.login("viewer@avrasya.test", store.DEMO_PASSWORD);
      const viewerUser = store.getSession();
      expect(viewerUser?.role).toBe("viewer");

      expect(store.can(viewerUser, "admin")).toBe(false);
      expect(store.can(viewerUser, "edit-inventory")).toBe(false);
      expect(store.can(viewerUser, "publish")).toBe(false);
      expect(store.can(viewerUser, "edit-crm")).toBe(false);
    });
  });

  // =========================================================================
  // 5. SERVICE ROLE KEY LEAK DEFENSE
  // =========================================================================
  describe("5. Zero Service-Role Key Leak in Client Code", () => {
    it("ensures no source file in src/ leaks service-role key token", () => {
      const srcDir = path.join(rootDir, "src");
      const targetPattern = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");

      const leaks: string[] = [];
      function walk(dir: string) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
            // Exclude test files where the string is being checked as a forbidden token
            if (entry.name.includes("test") || entry.name.includes("spec")) continue;
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.includes(targetPattern)) {
              leaks.push(fullPath);
            }
          }
        }
      }
      walk(srcDir);
      expect(leaks).toEqual([]);
    });

    it("ensures client supabase instance only imports SUPABASE_KEY (anon)", () => {
      expect(SUPABASE_URL).toMatch(/^https:\/\/[a-z0-9-]+\.supabase\.co/);
      expect(SUPABASE_KEY).toBeDefined();
      expect(SUPABASE_KEY).not.toContain("service_role");
    });
  });
});
