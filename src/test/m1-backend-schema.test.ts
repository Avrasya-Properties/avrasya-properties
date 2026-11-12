import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  ROLE_NAMES,
  RBAC_ROLE_MAP,
  DB_TO_RBAC_ROLE_MAP,
  MODULES,
  type StaffRole,
  type RbacRole,
} from "@/admin/management";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase";

describe("Milestone M1: Backend Schema & RBAC Hardening", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const migrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20261106000001_admin_cms_hardening.sql",
  );

  // =========================================================================
  // 1. MIGRATION FILE & SQL DDL PARSING VALIDATION
  // =========================================================================
  describe("Migration SQL Structure and DDL Statements", () => {
    it("migration file exists and is accessible", () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql.length).toBeGreaterThan(500);
    });

    it("includes services hardening: icon, cta_label, cta_link with IF NOT EXISTS", () => {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql).toMatch(/ALTER\s+TABLE\s+public\.services/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+icon\s+TEXT/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+cta_label\s+TEXT/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+cta_link\s+TEXT/i);
    });

    it("includes marketing_offers SEO hardening: seo_title, seo_description, og_image_url", () => {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql).toMatch(/ALTER\s+TABLE\s+public\.marketing_offers/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+seo_title\s+TEXT/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+seo_description\s+TEXT/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+og_image_url\s+TEXT/i);
    });

    it("updates private.save_offer to handle and snapshot SEO columns with length and protocol validation guards", () => {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql).toContain("CREATE OR REPLACE FUNCTION private.save_offer");
      expect(sql).toContain("'seo_title'");
      expect(sql).toContain("'seo_description'");
      expect(sql).toContain("'og_image_url'");

      // Validate SEO guards
      expect(sql).toContain("length(p_data->>'seo_title') > 255");
      expect(sql).toContain("length(p_data->>'seo_description') > 1000");
      expect(sql).toContain("length(p_data->>'og_image_url') > 2048");
      expect(sql).toContain("p_data->>'og_image_url' !~ '^(https://|/images/)[^[:space:]]+$'");
    });

    it("includes site_settings dynamic navigation and footer settings", () => {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql).toMatch(/ALTER\s+TABLE\s+public\.site_settings/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+navigation_items\s+JSONB/i);
      expect(sql).toMatch(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+footer_settings\s+JSONB/i);
      expect(sql).toContain("site_navigation_items_array");
      expect(sql).toContain("site_footer_settings_object");
    });

    it("includes storage_files RLS policies and idempotent storage.objects policy drops for authenticated staff uploads", () => {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql).toMatch(
        /ALTER\s+TABLE\s+public\.storage_files\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
      );
      expect(sql).toMatch(
        /GRANT\s+SELECT,\s*INSERT,\s*UPDATE,\s*DELETE\s+ON\s+public\.storage_files\s+TO\s+authenticated/i,
      );
      expect(sql).toContain("staff_read_storage_files");
      expect(sql).toContain("staff_insert_storage_files");
      expect(sql).toContain("staff_update_storage_files");
      expect(sql).toContain("staff_delete_storage_files");
      expect(sql).toContain("public-marketing");
      expect(sql).toContain("private-documents");

      // Verify idempotent drops for staff storage policies on storage.objects
      expect(sql).toContain('DROP POLICY IF EXISTS "staff_media_storage" ON storage.objects;');
      expect(sql).toContain('DROP POLICY IF EXISTS "staff_private_storage" ON storage.objects;');
    });

    it("includes audit_events triggers across core CMS entities", () => {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      expect(sql).toContain("CREATE OR REPLACE FUNCTION private.audit_record");
      expect(sql).toMatch(
        /TRIGGER\s+record_audit\s+AFTER\s+INSERT\s+OR\s+UPDATE\s+OR\s+DELETE\s+ON\s+public\.marketing_offers/i,
      );
      expect(sql).toMatch(
        /TRIGGER\s+record_audit\s+AFTER\s+INSERT\s+OR\s+UPDATE\s+OR\s+DELETE\s+ON\s+public\.site_settings/i,
      );
      expect(sql).toMatch(
        /TRIGGER\s+record_audit\s+AFTER\s+INSERT\s+OR\s+UPDATE\s+OR\s+DELETE\s+ON\s+public\.services/i,
      );
      expect(sql).toMatch(
        /TRIGGER\s+record_audit\s+AFTER\s+INSERT\s+OR\s+UPDATE\s+OR\s+DELETE\s+ON\s+public\.content_pages/i,
      );
      expect(sql).toMatch(
        /TRIGGER\s+record_audit\s+AFTER\s+INSERT\s+OR\s+UPDATE\s+OR\s+DELETE\s+ON\s+public\.content_sections/i,
      );
      expect(sql).toContain("staff_read_audit");
    });
  });

  // =========================================================================
  // 2. RBAC ROLE MAPPING & METADATA VERIFICATION
  // =========================================================================
  describe("RBAC Alignment & Role Mapping", () => {
    it("maps Super Admin cleanly to admin database staff_role", () => {
      expect(RBAC_ROLE_MAP["Super Admin"]).toBe("admin");
      expect(DB_TO_RBAC_ROLE_MAP["admin"]).toBe("Super Admin");
      expect(ROLE_NAMES["admin"]).toBe("Super Admin");
    });

    it("maps Admin cleanly to manager database staff_role", () => {
      expect(RBAC_ROLE_MAP["Admin"]).toBe("manager");
      expect(DB_TO_RBAC_ROLE_MAP["manager"]).toBe("Admin");
      expect(ROLE_NAMES["manager"]).toBe("Admin");
    });

    it("maps Editor cleanly to agent database staff_role", () => {
      expect(RBAC_ROLE_MAP["Editor"]).toBe("agent");
      expect(DB_TO_RBAC_ROLE_MAP["agent"]).toBe("Editor");
      expect(ROLE_NAMES["agent"]).toBe("Editor");
    });

    it("maps Viewer cleanly to viewer database staff_role", () => {
      expect(RBAC_ROLE_MAP["Viewer"]).toBe("viewer");
      expect(DB_TO_RBAC_ROLE_MAP["viewer"]).toBe("Viewer");
      expect(ROLE_NAMES["viewer"]).toBe("Viewer");
    });

    it("provides complete bi-directional mapping covering all 4 roles", () => {
      const rbacRoles: RbacRole[] = ["Super Admin", "Admin", "Editor", "Viewer"];
      const staffRoles: StaffRole[] = ["admin", "manager", "agent", "viewer"];

      for (const r of rbacRoles) {
        const dbRole = RBAC_ROLE_MAP[r];
        expect(staffRoles).toContain(dbRole);
        expect(DB_TO_RBAC_ROLE_MAP[dbRole]).toBe(r);
      }
    });

    it("registers services schema with icon, cta_label, and cta_link in management MODULES", () => {
      const servicesModule = MODULES.find((m) => m.table === "services");
      expect(servicesModule).toBeDefined();

      const fieldKeys = servicesModule?.fields.map((f) => f.key) || [];
      expect(fieldKeys).toContain("slug");
      expect(fieldKeys).toContain("title");
      expect(fieldKeys).toContain("category");
      expect(fieldKeys).toContain("icon");
      expect(fieldKeys).toContain("description");
      expect(fieldKeys).toContain("process_steps");
      expect(fieldKeys).toContain("cta_label");
      expect(fieldKeys).toContain("cta_link");
      expect(fieldKeys).toContain("sort_order");
      expect(fieldKeys).toContain("is_published");
    });

    it("registers staff_profiles in management MODULES with valid role options", () => {
      const staffModule = MODULES.find((m) => m.table === "staff_profiles");
      expect(staffModule).toBeDefined();

      const roleField = staffModule?.fields.find((f) => f.key === "role");
      expect(roleField).toBeDefined();
      expect(roleField?.options).toEqual(["admin", "manager", "agent", "viewer"]);
    });
  });

  // =========================================================================
  // 3. SERVICE-ROLE KEY PROTECTION & ENVIRONMENT LEAK PREVENTION
  // =========================================================================
  describe("Security: Service-Role Key Protection", () => {
    it("frontend supabase client only uses publishable/anon key, never service_role", () => {
      expect(SUPABASE_URL).toBeDefined();
      expect(SUPABASE_KEY).toBeDefined();
      expect(SUPABASE_KEY).not.toContain("service_role");

      // Verify JWT payload does not claim service_role if it is a JWT
      if (SUPABASE_KEY.startsWith("ey")) {
        const parts = SUPABASE_KEY.split(".");
        if (parts.length >= 2 && parts[1]) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          expect(payload.role).not.toBe("service_role");
        }
      }
    });

    it("scans all src/ files to guarantee zero references to SUPABASE_SERVICE_ROLE_KEY", () => {
      const srcDir = path.join(rootDir, "src");
      const forbiddenKey = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");

      function findLeaksInDir(dir: string): string[] {
        const leaks: string[] = [];
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            leaks.push(...findLeaksInDir(fullPath));
          } else if (file.isFile() && /\.(ts|tsx|js|jsx|json)$/.test(file.name)) {
            if (
              file.name === "m1-backend-schema.test.ts" ||
              file.name === "security-hygiene.test.ts"
            )
              continue;
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.includes(forbiddenKey)) {
              leaks.push(fullPath);
            }
          }
        }
        return leaks;
      }

      const leakingFiles = findLeaksInDir(srcDir);
      expect(leakingFiles).toEqual([]);
    });

    it("confirms .env file does not contain SUPABASE_SERVICE_ROLE_KEY", () => {
      const envPath = path.join(rootDir, ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      }
    });
  });
});
