import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { sanitizeSafeUrl, sanitizeEnquiryField, escapeJsonLd } from "@/lib/security";
import { applySecurityHeaders } from "@/server";
import { PartnersSection } from "@/components/site/PartnersSection";

const rootDir = path.resolve(__dirname, "../..");

describe("Comprehensive Audit: Security, UX Transitions, Performance & Cleanup", () => {
  describe("1. Security Utilities (sanitizeSafeUrl, sanitizeEnquiryField, escapeJsonLd)", () => {
    it("allows safe relative paths and https/http/mailto/tel URLs", () => {
      expect(sanitizeSafeUrl("/properties")).toBe("/properties");
      expect(sanitizeSafeUrl("/properties/avrasya-residences?view=3d")).toBe(
        "/properties/avrasya-residences?view=3d",
      );
      expect(sanitizeSafeUrl("#contact")).toBe("#contact");
      expect(sanitizeSafeUrl("https://avrasyaproperties.com/en")).toBe(
        "https://avrasyaproperties.com/en",
      );
      expect(sanitizeSafeUrl("mailto:info@avrasyaproperties.com")).toBe(
        "mailto:info@avrasyaproperties.com",
      );
      expect(sanitizeSafeUrl("tel:+905459248042")).toBe("tel:+905459248042");
    });

    it("blocks javascript:, data:, vbscript:, and protocol-relative // open-redirect URLs", () => {
      expect(sanitizeSafeUrl("javascript:alert(1)")).toBeUndefined();
      expect(sanitizeSafeUrl("  JAVASCRIPT:alert(document.cookie)")).toBeUndefined();
      expect(sanitizeSafeUrl("java\u0000script:alert(1)")).toBeUndefined();
      expect(sanitizeSafeUrl("data:text/html,<script>alert(1)</script>")).toBeUndefined();
      expect(sanitizeSafeUrl("vbscript:msgbox(1)")).toBeUndefined();
      expect(sanitizeSafeUrl("//evil.example.com/phishing")).toBeUndefined();
      expect(sanitizeSafeUrl("")).toBeUndefined();
      expect(sanitizeSafeUrl(null)).toBeUndefined();
      expect(sanitizeSafeUrl(undefined)).toBeUndefined();
    });

    it("strips control characters and enforces max length on enquiry fields", () => {
      const dirty = "  John\u0000\u0007\u001B Doe \n Advisory  ";
      expect(sanitizeEnquiryField(dirty, 120)).toBe("John Doe \n Advisory");
      expect(sanitizeEnquiryField("A".repeat(300), 120).length).toBe(120);
    });

    it("escapes </script> and HTML brackets inside JSON-LD payloads", () => {
      const payload = {
        "@context": "https://schema.org",
        name: "Avrasya </script><script>alert(1)</script>",
      };
      const serialized = escapeJsonLd(payload);
      expect(serialized).not.toContain("</script>");
      expect(serialized).toContain("\\u003c/script\\u003e");
      expect(JSON.parse(serialized)).toEqual(payload);
    });
  });

  describe("2. SSR & Static Security Headers", () => {
    it("applySecurityHeaders attaches hardened HTTP security headers to SSR responses", () => {
      const raw = new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      const secured = applySecurityHeaders(raw);

      expect(secured.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(secured.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
      expect(secured.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(secured.headers.get("Permissions-Policy")).toContain("camera=()");
      expect(secured.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
    });

    it("public/_headers configures security headers and immutable asset caching", () => {
      const headersPath = path.join(rootDir, "public/_headers");
      expect(fs.existsSync(headersPath)).toBe(true);
      const content = fs.readFileSync(headersPath, "utf-8");
      expect(content).toContain("X-Content-Type-Options: nosniff");
      expect(content).toContain("X-Frame-Options: SAMEORIGIN");
      expect(content).toContain("Cache-Control: public, max-age=31536000, immutable");
    });
  });

  describe("3. Component URL Sanitization & Secret Hygiene", () => {
    it("PartnersSection neutralizes unsafe javascript: partner website links", () => {
      render(
        <PartnersSection
          partners={[
            {
              id: "unsafe-1",
              name: "Unsafe Partner",
              logo: "/images/partners/the-initiate.png",
              website: "javascript:alert(1)",
              sortOrder: 1,
              is_visible: true,
            },
          ]}
        />,
      );

      expect(screen.queryByRole("link", { name: /Visit Unsafe Partner/i })).toBeNull();
      expect(screen.getAllByAltText(/Unsafe Partner logo/i).length).toBeGreaterThan(0);
    });

    it("backend/config.ts contains zero hardcoded eyJ JWT tokens", () => {
      const backendConfig = fs.readFileSync(path.join(rootDir, "backend/config.ts"), "utf-8");
      expect(backendConfig).not.toMatch(/['"]eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
    });
  });

  describe("4. Codebase Cleanup & Repository Structure", () => {
    it("removes abandoned unreferenced legacy components and temporary SQL split dumps", () => {
      const removedFiles = [
        "src/components/framer/CaldrenDevelopmentTable.tsx",
        "src/components/site/IstanbulSkyline.tsx",
        "src/components/site/ProcessSteps.tsx",
        "src/components/site/hero/HeroBackdrop.tsx",
        "src/components/site/hero/LazySkylineScene.tsx",
        "src/components/site/hero/SkylineScene.tsx",
        "backend/importer/cand_a.sql",
        "backend/importer/cand_b.sql",
        "backend/importer/exec_a.json",
        "backend/importer/p1_a.sql",
        "backend/importer/p1_b.sql",
        "backend/importer/part1.sql",
        "backend/importer/part2.sql",
        "backend/importer/part3.sql",
        "backend/importer/part3_a.sql",
        "backend/importer/part3_b.sql",
        "backend/importer/part4.sql",
        "package-lock.json",
      ];

      for (const rel of removedFiles) {
        expect(fs.existsSync(path.join(rootDir, rel)), `Expected ${rel} to be removed`).toBe(false);
      }
    });

    it("organizes project documentation cleanly inside docs/ and maintains a comprehensive README.md", () => {
      expect(fs.existsSync(path.join(rootDir, "docs/BACKEND_ARCHITECTURE.md"))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, "docs/DESIGN.md"))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, "docs/PRODUCT.md"))).toBe(true);

      const readme = fs.readFileSync(path.join(rootDir, "README.md"), "utf-8");
      expect(readme).toContain("## Architecture & Tech Stack");
      expect(readme).toContain("## Repository Structure");
      expect(readme).toContain("## Security & Environment Configuration");
    });
  });
});
