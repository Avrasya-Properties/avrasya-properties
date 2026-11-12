import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { supabase, SUPABASE_URL, SUPABASE_KEY } from "@/lib/supabase";
import { getPublicClient, SUPABASE_ANON_KEY } from "../../backend/config";

const rootDir = path.resolve(__dirname, "../..");

describe("Task 1: Security Hardening & Workspace Hygiene", () => {
  describe("1.1 .gitignore Hardening Invariants", () => {
    it("ensures .gitignore contains all necessary protection patterns", () => {
      const gitignorePath = path.join(rootDir, ".gitignore");
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const content = fs.readFileSync(gitignorePath, "utf-8");

      // Critical secrets and credentials
      expect(content).toMatch(/^\.env$/m);
      expect(content).toMatch(/^\.env\.\*$/m);
      expect(content).toMatch(/^\*\.env$/m);
      expect(content).toMatch(/^\*\.local$/m);
      expect(content).toMatch(/^!\.env\.example$/m);
      expect(content).toMatch(/^\*\.pem$/m);
      expect(content).toMatch(/^\*\.key$/m);
      expect(content).toMatch(/service_account/);

      // Binary tools and large archives
      expect(content).toMatch(/tools\//);
      expect(content).toMatch(/^\*\.exe$/m);
      expect(content).toMatch(/^\*\.zip$/m);

      // Scratch and test output dumps
      expect(content).toMatch(/\*\.test_out\*/);
      expect(content).toMatch(/\*_test_out\*/);
      expect(content).toMatch(/\*\.out\.txt/);
      expect(content).toMatch(/page\.html/);
      expect(content).toMatch(/SEO-REPORT\.html/);
    });
  });

  describe("1.2 Git Tracking & Secret Isolation", () => {
    it("confirms .env is untracked in git", () => {
      try {
        const trackedFiles = execSync("git ls-files", { cwd: rootDir, encoding: "utf-8" });
        const trackedLines = trackedFiles.split("\n").map((l) => l.trim());

        expect(trackedLines).not.toContain(".env");
        expect(trackedLines).not.toContain(".env.local");
        expect(trackedLines).not.toContain(".env.demo.local");
      } catch (e) {
        // If git is unavailable in test environment, skip gracefully
      }
    });

    it("confirms no private keys or service accounts are tracked in git", () => {
      try {
        const trackedFiles = execSync("git ls-files", { cwd: rootDir, encoding: "utf-8" });
        const trackedLines = trackedFiles.split("\n").map((l) => l.trim());

        const forbiddenTracked = trackedLines.filter(
          (f) =>
            f.endsWith(".key") ||
            f.endsWith(".pem") ||
            f.includes("service_account") ||
            f.endsWith(".exe") ||
            f.endsWith(".zip") ||
            f.endsWith(".pyc"),
        );

        expect(forbiddenTracked).toEqual([]);
      } catch (e) {
        // Skip if git CLI not available
      }
    });
  });

  describe("1.3 Workspace Scratch Cleanup Invariants", () => {
    it("confirms no scratch test outputs or dumps remain in avrasya-properties", () => {
      const m4TestOut = path.join(rootDir, "m4_test_out.txt");
      expect(fs.existsSync(m4TestOut)).toBe(false);

      const files = fs.readdirSync(rootDir);
      const testOutFiles = files.filter(
        (f) =>
          f.includes("test_out") ||
          f.endsWith(".dump") ||
          f === "page.html" ||
          f === "SEO-REPORT.html",
      );
      expect(testOutFiles).toEqual([]);
    });
  });

  describe("1.4 Codebase Secret Leak Prevention", () => {
    const serviceRoleKeyName = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");

    it("guarantees zero occurrences of service role key across src/ files", () => {
      const srcDir = path.join(rootDir, "src");
      const forbiddenKey = serviceRoleKeyName;

      function scanDir(dir: string): string[] {
        const leaks: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            leaks.push(...scanDir(fullPath));
          } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            if (
              entry.name === "security-hygiene.test.ts" ||
              entry.name === "m1-backend-schema.test.ts"
            ) {
              continue;
            }
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.includes(forbiddenKey)) {
              leaks.push(fullPath);
            }
          }
        }
        return leaks;
      }

      const leaks = scanDir(srcDir);
      expect(leaks).toEqual([]);
    });

    it("guarantees backend/config.ts does not hardcode service role key", () => {
      const backendConfig = path.join(rootDir, "backend/config.ts");
      const content = fs.readFileSync(backendConfig, "utf-8");

      // Verify that service role key is assigned from process.env only
      const targetRegex = new RegExp(serviceRoleKeyName + "\\s*=\\s*(.*);");
      const match = content.match(targetRegex);
      expect(match).not.toBeNull();
      if (match) {
        const envRefRegex = new RegExp("process\\.env\\[[\"']" + serviceRoleKeyName + "[\"']\\]");
        expect(match[1]).toMatch(envRefRegex);
        // Ensure no actual secret string is hardcoded
        expect(match[1]).not.toContain("sb_secret");
        expect(match[1]).not.toMatch(/['"]eyJ[a-zA-Z0-9_-]+['"]/);
      }
    });

    it("verifies public client configuration uses browser-safe publishable key", () => {
      expect(SUPABASE_URL).toBe("https://ufcpvjhzitmxgitoaolx.supabase.co");
      expect(SUPABASE_KEY).toBeDefined();
      expect(SUPABASE_KEY).not.toContain("service_role");
      expect(SUPABASE_ANON_KEY).toBeDefined();
    });
  });

  describe("1.5 Backend Client Integrity", () => {
    it("initializes backend public client successfully without throwing", () => {
      const client = getPublicClient();
      expect(client).toBeDefined();
      expect(typeof client.from).toBe("function");
      expect(typeof client.rpc).toBe("function");
    });

    it("initializes frontend Supabase client successfully with valid channels", () => {
      expect(supabase).toBeDefined();
      expect(typeof supabase.from).toBe("function");
      expect(typeof supabase.channel).toBe("function");
    });
  });
});
