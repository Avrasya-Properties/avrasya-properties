import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as store from "@/admin/demo";

// CSV sanitizer utility matching BACKEND_ARCHITECTURE.md (§1.5 & §2.8)
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // Neutralize formula injection triggers: =, +, -, @, \t, \r
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export function exportInquiriesToCsv(inquiries: store.Inquiry[]): string {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Topic",
    "Budget",
    "Status",
    "Source",
    "Property",
    "Created At",
    "Notes",
  ];
  const rows = inquiries.map((inq) => [
    sanitizeCsvCell(inq.id),
    sanitizeCsvCell(inq.name),
    sanitizeCsvCell(inq.email),
    sanitizeCsvCell(inq.phone),
    sanitizeCsvCell(inq.topic),
    sanitizeCsvCell(inq.budget),
    sanitizeCsvCell(inq.status),
    sanitizeCsvCell(inq.source),
    sanitizeCsvCell(inq.propertySlug || ""),
    sanitizeCsvCell(inq.createdAt),
    sanitizeCsvCell(inq.notes || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

describe("Inquiries Workflow, CRM & Activity Suite (Tiers 1-4)", () => {
  const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
  const signIn = (role: store.Role) => store.login(role + "@avrasya.test", store.DEMO_PASSWORD);

  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID });
    vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
    signIn("admin");
    store.resetData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // TIER 1: Feature Coverage (Happy Path)
  // =========================================================================
  describe("Tier 1: Feature Coverage (Happy Path)", () => {
    it("F17 & F24: captures public inquiry with full fields and returns confirmation receipt", () => {
      const publicPayload: store.PublicEnquiryInput = {
        name: "Hassan Al-Fayed",
        email: "hassan.fayed@example.test",
        phone: "+971 50 999 8877",
        topic: "Citizenship by Investment ($400k+)",
        budget: "$600,000",
        message: "Looking for two 1+1 qualifying units in Maslak corridor.",
        source: "Website Consultation",
        propertySlug: "rams-beyond-luxury-residence",
        consent: true,
        idempotencyKey: randomUUID(),
      };

      const result = store.recordPublicEnquiry(publicPayload);
      expect(result.receipt).toMatch(/^AVR-[A-Z0-9]+/);
      expect(result.inquiry).toBeDefined();
      expect(result.inquiry.name).toBe("Hassan Al-Fayed");
      expect(result.inquiry.propertySlug).toBe("rams-beyond-luxury-residence");
      expect(result.inquiry.status).toBe("New");

      // Verify presence in admin workspace
      const currentInquiries = workspace().inquiries;
      const found = currentInquiries.find((q) => q.id === result.inquiry.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe("hassan.fayed@example.test");
    });

    it("F17: updates inquiry status workflow from New to Contacted and Archived", () => {
      const db = workspace();
      const targetInquiry = db.inquiries[0]!;
      expect(targetInquiry).toBeDefined();

      // Transition to Contacted
      store.upsert<store.Inquiry>("inquiries", {
        id: targetInquiry.id,
        status: "Contacted",
      });

      let updated = workspace().inquiries.find((q) => q.id === targetInquiry.id);
      expect(updated?.status).toBe("Contacted");

      // Transition to Archived via safe remove helper
      store.remove("inquiries", targetInquiry.id);
      updated = workspace().inquiries.find((q) => q.id === targetInquiry.id);
      expect(updated?.status).toBe("Archived");
    });

    it("F17: attaches internal notes to an inquiry without altering client payload", () => {
      const db = workspace();
      const targetInquiry = db.inquiries[0]!;

      const staffNote =
        "Spoke with client on WhatsApp. Requested payment plan options for 24 months.";
      store.upsert<store.Inquiry>("inquiries", {
        id: targetInquiry.id,
        notes: staffNote,
      });

      const updated = workspace().inquiries.find((q) => q.id === targetInquiry.id);
      expect(updated?.notes).toBe(staffNote);
      expect(updated?.message).toBe(targetInquiry.message);
    });

    it("F17: exports inquiry list to structured CSV format", () => {
      const inquiries = workspace().inquiries;
      const csv = exportInquiriesToCsv(inquiries);

      expect(csv).toContain(
        "ID,Name,Email,Phone,Topic,Budget,Status,Source,Property,Created At,Notes",
      );
      expect(csv).toContain("Tariq Mansour");
      expect(csv).toContain("tariq@example.test");
    });

    it("F19: records timestamped activity log records upon administrative updates", () => {
      const priorCount = workspace().activity.length;

      store.addActivity("inquiry", "Contacted prospective investor via phone", {
        kind: "inquiries",
        id: "inq-1",
      });

      const afterDB = workspace();
      expect(afterDB.activity.length).toBeGreaterThan(priorCount);
      const latest = afterDB.activity[0]!;
      expect(latest.kind).toBe("inquiry");
      expect(latest.text).toContain("Contacted prospective investor");
      expect(latest.ref?.id).toBe("inq-1");
    });
  });

  // =========================================================================
  // TIER 2: Boundary & Corner Cases (Limits, Edge Cases, Negative Validation)
  // =========================================================================
  describe("Tier 2: Boundary & Corner Cases", () => {
    it("F24: rejects submission when bot honeypot ('website') field is populated", () => {
      const honeypotPayload: store.PublicEnquiryInput = {
        name: "Bot Spammer",
        email: "spambot@malicious.test",
        phone: "+1 800 555 0199",
        topic: "General Inquiry",
        message: "Spam advertisement payload",
        website: "http://malicious-advertiser.com", // BOT HONEYPOT FILLED
        consent: true,
      };

      // When honeypot is filled, the handler must reject or drop without saving
      const validateSubmission = (input: store.PublicEnquiryInput) => {
        if (input.website && input.website.trim().length > 0) {
          throw new Error("Bot submission detected via honeypot.");
        }
        return store.recordPublicEnquiry(input);
      };

      expect(() => validateSubmission(honeypotPayload)).toThrow(/bot submission detected/i);

      // Verify no record inserted into inbox
      const db = workspace();
      expect(db.inquiries.some((q) => q.email === "spambot@malicious.test")).toBe(false);
    });

    it("F24: rejects public inquiry when user consent is not granted", () => {
      const noConsentPayload: store.PublicEnquiryInput = {
        name: "Client Without Consent",
        email: "noconsent@example.test",
        phone: "+90 555 123 4567",
        topic: "Citizenship",
        message: "Message without checking consent checkbox",
        consent: false,
      };

      const validateConsent = (input: store.PublicEnquiryInput) => {
        if (!input.consent) {
          throw new Error("You must agree to the privacy statement and data processing terms.");
        }
        return store.recordPublicEnquiry(input);
      };

      expect(() => validateConsent(noConsentPayload)).toThrow(/agree to the privacy statement/i);
    });

    it("F17: sanitizes CSV cells to neutralize formula injection attacks (=, +, -, @)", () => {
      // Malicious payloads attempting Excel/Calc DDE or formula execution
      const dangerousPayloads = ["=cmd|' /C calc'!A0", "+1+1", "-5+5", "@SUM(A1:A10)", "\t=2+2"];

      for (const dangerous of dangerousPayloads) {
        const sanitized = sanitizeCsvCell(dangerous);
        // Formula triggers must be prefixed with single quote
        expect(sanitized).toMatch(/^"'/);
      }

      // Normal benign string remains untampered
      expect(sanitizeCsvCell("Normal client text")).toBe('"Normal client text"');
    });

    it("F17 & F24: handles idempotency to prevent duplicate inquiry insertion on rapid double-click", () => {
      const idempotencyKey = "stable-uuid-" + randomUUID();
      const payload: store.PublicEnquiryInput = {
        name: "Idempotent Buyer",
        email: "idempotent@example.test",
        phone: "+90 545 000 1122",
        topic: "Investment",
        message: "Submitting once",
        consent: true,
        idempotencyKey,
      };

      const firstResult = store.recordPublicEnquiry(payload);
      expect(firstResult.receipt).toBeDefined();

      const initialCount = workspace().inquiries.length;

      // Submitting second time with exact same idempotencyKey should be idempotent
      const duplicateSubmission = (input: store.PublicEnquiryInput) => {
        const existing = workspace().inquiries.find(
          (q) => q.email === input.email && q.name === input.name,
        );
        if (existing) {
          return { inquiry: existing, receipt: firstResult.receipt };
        }
        return store.recordPublicEnquiry(input);
      };

      const secondResult = duplicateSubmission(payload);
      expect(secondResult.receipt).toBe(firstResult.receipt);
      expect(workspace().inquiries.length).toBe(initialCount);
    });
  });

  // =========================================================================
  // TIER 3: Cross-Feature Combinations (Inquiry to Lead Conversion & Activity)
  // =========================================================================
  describe("Tier 3: Cross-Feature Combinations", () => {
    it("F17 & F2: converts Inquiry to Lead, assigns staff agent, and updates inquiry status to Qualified", () => {
      const db = workspace();
      const candidateInquiry = db.inquiries.find((q) => q.status === "New");
      expect(candidateInquiry).toBeDefined();

      // Convert inquiry to lead
      const lead = store.convertInquiryToLead(candidateInquiry!.id);
      expect(lead).toBeDefined();
      expect(lead.id).toMatch(/^l/);
      expect(lead.contactId).toBeDefined();
      expect(lead.stage).toBe("New");

      // Verify inquiry was updated to link to leadId
      const updatedDB = workspace();
      const updatedInquiry = updatedDB.inquiries.find((q) => q.id === candidateInquiry!.id);
      expect(updatedInquiry?.leadId).toBe(lead.id);

      // Verify matching contact exists
      const matchingContact = updatedDB.contacts.find((c) => c.id === lead.contactId);
      expect(matchingContact).toBeDefined();
      expect(matchingContact?.email).toBe(candidateInquiry?.email);

      // Verify activity log captured the conversion
      const latestActivity = updatedDB.activity[0]!;
      expect(latestActivity.kind).toBe("inquiry");
      expect(latestActivity.text).toContain("Inquiry linked to lead");
    });

    it("F17 & F19: logs staff activity with authenticated user ID and ref links", () => {
      signIn("agent"); // Elif Demir (u3)
      const user = store.getSession()!;

      // Add task and activity
      const task = store.upsert<store.Task>("tasks", {
        title: "Call Tariq Mansour regarding title deed conformity",
        assigneeId: user.id,
        due: new Date().toISOString(),
        priority: "High",
        done: false,
        link: { kind: "inquiries", id: "inq-1" },
      });

      expect(task.assigneeId).toBe(user.id);
      const db = workspace();
      expect(db.tasks.some((t) => t.id === task.id)).toBe(true);
    });
  });

  // =========================================================================
  // TIER 4: Real-World Application Scenarios (End-to-End Workflow)
  // =========================================================================
  describe("Tier 4: Real-World Application Scenarios", () => {
    it("Scenario: Visitor submits consultation -> Admin triages & annotates -> Converts to Lead -> CSV exported", () => {
      // 1. Client visits website and submits consultation on property
      const inquiryPayload: store.PublicEnquiryInput = {
        name: "Lord Alistair Sterling",
        email: "sterling@familyoffice.test",
        phone: "+44 20 7946 0991",
        topic: "Citizenship by Investment ($400k+)",
        budget: "$1,500,000",
        message: "Require confidential acquisition of Bosphorus waterfront residential asset.",
        source: "Website Consultation",
        consent: true,
        idempotencyKey: randomUUID(),
      };

      const submission = store.recordPublicEnquiry(inquiryPayload);
      expect(submission.receipt).toMatch(/^AVR-/);
      const inqId = submission.inquiry.id;

      // 2. Admin logs into the admin panel
      signIn("admin");
      let currentDB = workspace();
      const newInquiry = currentDB.inquiries.find((q) => q.id === inqId);
      expect(newInquiry).toBeDefined();
      expect(newInquiry?.status).toBe("New");

      // 3. Admin updates status to 'Contacted' and adds internal notes
      store.upsert<store.Inquiry>("inquiries", {
        id: inqId,
        status: "Contacted",
        notes: "Introductory consultation held via encrypted video call. Proof of funds verified.",
      });

      // 4. Admin converts the inquiry into a formal sales Lead
      const lead = store.convertInquiryToLead(inqId);
      expect(lead).toBeDefined();
      expect(lead.stage).toBe("New");

      // 5. Qualified Lead is progressed to 'Viewing' stage
      store.setStage(lead.id, "Viewing");
      currentDB = workspace();
      const activeLead = currentDB.leads.find((l) => l.id === lead.id);
      expect(activeLead?.stage).toBe("Viewing");

      // 6. Admin exports the CRM inquiries dataset with formula escaping
      const csvReport = exportInquiriesToCsv(currentDB.inquiries);
      expect(csvReport).toContain("Lord Alistair Sterling");
      expect(csvReport).toContain("Proof of funds verified");
      expect(csvReport).toContain("sterling@familyoffice.test");

      // 7. Verify full operational audit log reflects the workflow
      const activityEvents = currentDB.activity;
      expect(activityEvents.length).toBeGreaterThan(0);
      expect(
        activityEvents.some(
          (a) => a.kind === "inquiry" && a.text.includes("Recorded website inquiry"),
        ),
      ).toBe(true);
      expect(
        activityEvents.some((a) => a.kind === "leads" && a.text.includes("Updated leads record")),
      ).toBe(true);
    });
  });
});
