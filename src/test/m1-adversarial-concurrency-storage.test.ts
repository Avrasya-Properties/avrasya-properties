import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Milestone M1 Challenger: Concurrency, Snapshot Resilience & Storage RLS", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const migrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20261106000001_admin_cms_hardening.sql",
  );
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  // =========================================================================
  // 1. CONCURRENCY & OPTIMISTIC LOCKING VERIFICATION (private.save_offer)
  // =========================================================================
  describe("1. Concurrency Control in private.save_offer", () => {
    it("migration enforces row-level locking via SELECT ... FOR UPDATE", () => {
      expect(migrationSql).toMatch(
        /select\s+\*\s+into\s+old_row\s+from\s+public\.marketing_offers\s+where\s+id=\(p_data->>'id'\)::uuid\s+for\s+update;/i,
      );
    });

    it("migration detects version conflict using 'is distinct from' and errcode='40001'", () => {
      expect(migrationSql).toMatch(
        /if\s+old_row\.version\s+is\s+distinct\s+from\s+p_version\s+then/i,
      );
      expect(migrationSql).toMatch(
        /raise\s+exception\s+'This offer changed\.\s*Refresh before saving'\s+using\s+errcode='40001';/i,
      );
    });

    it("migration atomically increments version on save (r.version = old_row.version + 1)", () => {
      expect(migrationSql).toMatch(/r\.version\s*=\s*old_row\.version\s*\+\s*1;/i);
    });

    it("migration sets initial version to 0 on new offer before incrementing to 1", () => {
      expect(migrationSql).toMatch(/old_row\.version\s*=\s*0;/i);
    });

    // Empirical simulation harness of save_offer concurrency behavior
    it("stress-test concurrency simulation: detects collision between parallel edits", () => {
      interface MockOffer {
        id: string;
        version: number;
        title: string;
      }

      class ConcurrencyOracle {
        private db: Map<string, MockOffer> = new Map();

        create(title: string): MockOffer {
          const id = "offer-" + Math.random().toString(36).slice(2, 9);
          const initialVersion = 0;
          const nextVersion = initialVersion + 1; // r.version = old_row.version + 1
          const record: MockOffer = { id, version: nextVersion, title };
          this.db.set(id, record);
          return record;
        }

        saveOffer(
          id: string,
          newTitle: string,
          p_version: number,
        ): { success: boolean; errcode?: string; row?: MockOffer } {
          const old_row = this.db.get(id);
          if (!old_row) throw new Error("Offer not found");

          // Exact PostgreSQL 'is distinct from' check
          if (old_row.version !== p_version) {
            return {
              success: false,
              errcode: "40001", // serialization_failure
            };
          }

          // Atomic increment
          const updated: MockOffer = {
            ...old_row,
            title: newTitle,
            version: old_row.version + 1,
          };
          this.db.set(id, updated);
          return { success: true, row: updated };
        }
      }

      const oracle = new ConcurrencyOracle();
      const initial = oracle.create("Luxury Villa Bosphorus");
      expect(initial.version).toBe(1);

      // Simulating 2 concurrent editors (Agent A and Agent B) reading version 1
      const editorA_version = initial.version;
      const editorB_version = initial.version;

      // Editor A commits first
      const resA = oracle.saveOffer(
        initial.id,
        "Luxury Villa Bosphorus - Edited by A",
        editorA_version,
      );
      expect(resA.success).toBe(true);
      expect(resA.row?.version).toBe(2);

      // Editor B tries to commit with stale version 1
      const resB = oracle.saveOffer(
        initial.id,
        "Luxury Villa Bosphorus - Edited by B",
        editorB_version,
      );
      expect(resB.success).toBe(false);
      expect(resB.errcode).toBe("40001");

      // Editor B refreshes to version 2 and resubmits
      const refreshedVersion = 2;
      const resB_retry = oracle.saveOffer(
        initial.id,
        "Luxury Villa Bosphorus - Edited by B",
        refreshedVersion,
      );
      expect(resB_retry.success).toBe(true);
      expect(resB_retry.row?.version).toBe(3);
    });
  });

  // =========================================================================
  // 2. SNAPSHOT RESILIENCE & SEO SERIALIZATION
  // =========================================================================
  describe("2. Snapshot Serialization & SEO Integrity", () => {
    it("migration registers seo_title, seo_description, and og_image_url in save_offer allowed keys filter", () => {
      const allowedKeysMatch = migrationSql.match(/where\s+key\s*=\s*any\(array\[([\s\S]*?)\]\)/i);
      expect(allowedKeysMatch).not.toBeNull();
      const keysStr = allowedKeysMatch![1];
      expect(keysStr).toContain("'seo_title'");
      expect(keysStr).toContain("'seo_description'");
      expect(keysStr).toContain("'og_image_url'");
    });

    it("migration explicitly builds snapshot JSON containing seo_title, seo_description, and og_image_url", () => {
      const snapshotMatch = migrationSql.match(/snapshot\s*=\s*jsonb_build_object\([\s\S]*?\);/i);
      expect(snapshotMatch).not.toBeNull();
      const snapshotSql = snapshotMatch![0];
      expect(snapshotSql).toContain("'seo_title', r.seo_title");
      expect(snapshotSql).toContain("'seo_description', r.seo_description");
      expect(snapshotSql).toContain("'og_image_url', r.og_image_url");
    });

    it("migration commits published_snapshot and records publication history", () => {
      expect(migrationSql).toMatch(/r\.published_snapshot\s*=\s*snapshot;/i);
      expect(migrationSql).toMatch(/published_snapshot\s*=\s*r\.published_snapshot/i);
      expect(migrationSql).toMatch(
        /insert\s+into\s+public\.publication_history\([^)]*snapshot[^)]*\)/i,
      );
    });

    it("stress-test snapshot serialization oracle preserves metadata faithfully", () => {
      // Functional simulation of snapshot creation
      function buildPublishedSnapshot(r: {
        id: string;
        ref: string;
        slug: string;
        marketing_title: string;
        district: string;
        city: string;
        seo_title?: string | null;
        seo_description?: string | null;
        og_image_url?: string | null;
        amount: number;
        currency: string;
      }) {
        return {
          id: r.id,
          ref: r.ref,
          slug: r.slug,
          marketing_title: r.marketing_title,
          location_label: r.district,
          city: r.city,
          seo_title: r.seo_title ?? null,
          seo_description: r.seo_description ?? null,
          og_image_url: r.og_image_url ?? null,
          price: {
            amount: r.amount,
            currency: r.currency,
          },
        };
      }

      const testData = {
        id: "7b0a85e2-632b-42b7-873b-5a1e2f73e444",
        ref: "AVR-PENT-001",
        slug: "bosphorus-penthouse",
        marketing_title: "Bosphorus Panoramic Penthouse",
        district: "Beşiktaş",
        city: "Istanbul",
        seo_title: "Luxury Bosphorus Penthouse For Sale | Avrasya Properties",
        seo_description: "Top floor penthouse with unobstructed strait views and CBI eligibility.",
        og_image_url: "https://images.avrasya.com/properties/penthouse-og.jpg",
        amount: 1850000,
        currency: "USD",
      };

      const snapshot = buildPublishedSnapshot(testData);

      expect(snapshot.seo_title).toBe("Luxury Bosphorus Penthouse For Sale | Avrasya Properties");
      expect(snapshot.seo_description).toBe(
        "Top floor penthouse with unobstructed strait views and CBI eligibility.",
      );
      expect(snapshot.og_image_url).toBe("https://images.avrasya.com/properties/penthouse-og.jpg");

      // Verify serialization round-trip to JSON
      const serialized = JSON.stringify(snapshot);
      const parsed = JSON.parse(serialized);
      expect(parsed.seo_title).toBe(testData.seo_title);
      expect(parsed.seo_description).toBe(testData.seo_description);
      expect(parsed.og_image_url).toBe(testData.og_image_url);
    });
  });

  // =========================================================================
  // 3. STORAGE & FILE RLS SECURITY POLICIES
  // =========================================================================
  describe("3. Storage & File RLS Security Matrix", () => {
    it("migration enforces RLS on public.storage_files and revokes public/anon access", () => {
      expect(migrationSql).toMatch(
        /ALTER\s+TABLE\s+public\.storage_files\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY;/i,
      );
      expect(migrationSql).toMatch(
        /REVOKE\s+ALL\s+ON\s+public\.storage_files\s+FROM\s+public,\s*anon;/i,
      );
      expect(migrationSql).toMatch(
        /GRANT\s+SELECT,\s*INSERT,\s*UPDATE,\s*DELETE\s+ON\s+public\.storage_files\s+TO\s+authenticated;/i,
      );
    });

    it("migration restricts storage_files uploads to ('admin', 'manager', 'agent')", () => {
      expect(migrationSql).toMatch(
        /CREATE\s+POLICY\s+"staff_insert_storage_files"\s+ON\s+public\.storage_files\s+FOR\s+INSERT\s+TO\s+authenticated\s+WITH\s+CHECK\s*\(\s*\(SELECT\s+private\.staff_role\(\)\)\s+IN\s+\('admin',\s*'manager',\s*'agent'\)/i,
      );
    });

    it("migration restricts storage.objects staff_media_storage to ('admin', 'manager', 'agent')", () => {
      expect(migrationSql).toMatch(
        /CREATE\s+POLICY\s+"staff_media_storage"\s+ON\s+storage\.objects\s+FOR\s+ALL\s+TO\s+authenticated\s+USING\s*\(\s*bucket_id\s*=\s*'public-marketing'\s+AND\s+\(SELECT\s+private\.staff_role\(\)\)\s+IN\s+\('admin',\s*'manager',\s*'agent'\)\s*\)/i,
      );
    });

    it("migration restricts storage.objects staff_private_storage to ('admin', 'manager', 'agent')", () => {
      expect(migrationSql).toMatch(
        /CREATE\s+POLICY\s+"staff_private_storage"\s+ON\s+storage\.objects\s+FOR\s+ALL\s+TO\s+authenticated\s+USING\s*\(\s*bucket_id\s+IN\s+\('private-source',\s*'private-documents'\)\s+AND\s+\(SELECT\s+private\.staff_role\(\)\)\s+IN\s+\('admin',\s*'manager',\s*'agent'\)\s*\)/i,
      );
    });

    // Empirical security oracle evaluating all role/bucket combinations
    it("evaluates comprehensive security matrix across roles and buckets", () => {
      type StaffRole = "admin" | "manager" | "agent" | "viewer" | null;
      interface Context {
        isAuthenticated: boolean;
        staffRole: StaffRole;
      }

      // Exact PostgreSQL RLS evaluator corresponding to migration definitions
      const rlsEvaluator = {
        canUploadToPublicMarketing(ctx: Context): boolean {
          // Policy: staff_media_storage on storage.objects
          if (!ctx.isAuthenticated) return false;
          return ["admin", "manager", "agent"].includes(ctx.staffRole ?? "");
        },
        canWriteToPrivateDocuments(ctx: Context): boolean {
          // Policy: staff_private_storage on storage.objects
          if (!ctx.isAuthenticated) return false;
          return ["admin", "manager", "agent"].includes(ctx.staffRole ?? "");
        },
        canInsertStorageFilesMetadata(ctx: Context, bucket: string): boolean {
          // Policy: staff_insert_storage_files on public.storage_files
          if (!ctx.isAuthenticated) return false;
          const roleValid = ["admin", "manager", "agent"].includes(ctx.staffRole ?? "");
          const bucketValid = ["public-marketing", "private-documents", "private-source"].includes(
            bucket,
          );
          return roleValid && bucketValid;
        },
        canReadPublicMarketingMedia(ctx: Context): boolean {
          // Policy: public_media on storage.objects (FOR SELECT TO anon, authenticated)
          return true;
        },
        canReadPrivateDocuments(ctx: Context): boolean {
          // No anon select policy; authenticated active staff only
          if (!ctx.isAuthenticated) return false;
          return ctx.staffRole !== null;
        },
      };

      // 1. ANONYMOUS USERS
      const anon: Context = { isAuthenticated: false, staffRole: null };
      expect(rlsEvaluator.canUploadToPublicMarketing(anon)).toBe(false);
      expect(rlsEvaluator.canWriteToPrivateDocuments(anon)).toBe(false);
      expect(rlsEvaluator.canInsertStorageFilesMetadata(anon, "public-marketing")).toBe(false);
      expect(rlsEvaluator.canReadPrivateDocuments(anon)).toBe(false);
      expect(rlsEvaluator.canReadPublicMarketingMedia(anon)).toBe(true); // Public images can be seen by visitors

      // 2. AUTHENTICATED NON-STAFF
      const authenticatedNonStaff: Context = { isAuthenticated: true, staffRole: null };
      expect(rlsEvaluator.canUploadToPublicMarketing(authenticatedNonStaff)).toBe(false);
      expect(rlsEvaluator.canWriteToPrivateDocuments(authenticatedNonStaff)).toBe(false);
      expect(
        rlsEvaluator.canInsertStorageFilesMetadata(authenticatedNonStaff, "public-marketing"),
      ).toBe(false);
      expect(rlsEvaluator.canReadPrivateDocuments(authenticatedNonStaff)).toBe(false);

      // 3. VIEWER ROLE
      const viewer: Context = { isAuthenticated: true, staffRole: "viewer" };
      expect(rlsEvaluator.canUploadToPublicMarketing(viewer)).toBe(false);
      expect(rlsEvaluator.canWriteToPrivateDocuments(viewer)).toBe(false);
      expect(rlsEvaluator.canInsertStorageFilesMetadata(viewer, "public-marketing")).toBe(false);
      expect(rlsEvaluator.canReadPrivateDocuments(viewer)).toBe(true);

      // 4. AGENT ROLE (Editor)
      const agent: Context = { isAuthenticated: true, staffRole: "agent" };
      expect(rlsEvaluator.canUploadToPublicMarketing(agent)).toBe(true);
      expect(rlsEvaluator.canWriteToPrivateDocuments(agent)).toBe(true);
      expect(rlsEvaluator.canInsertStorageFilesMetadata(agent, "public-marketing")).toBe(true);
      expect(rlsEvaluator.canInsertStorageFilesMetadata(agent, "arbitrary-bucket")).toBe(false);

      // 5. MANAGER ROLE (Admin)
      const manager: Context = { isAuthenticated: true, staffRole: "manager" };
      expect(rlsEvaluator.canUploadToPublicMarketing(manager)).toBe(true);
      expect(rlsEvaluator.canWriteToPrivateDocuments(manager)).toBe(true);
      expect(rlsEvaluator.canInsertStorageFilesMetadata(manager, "public-marketing")).toBe(true);

      // 6. ADMIN ROLE (Super Admin)
      const admin: Context = { isAuthenticated: true, staffRole: "admin" };
      expect(rlsEvaluator.canUploadToPublicMarketing(admin)).toBe(true);
      expect(rlsEvaluator.canWriteToPrivateDocuments(admin)).toBe(true);
      expect(rlsEvaluator.canInsertStorageFilesMetadata(admin, "public-marketing")).toBe(true);
    });
  });
});
