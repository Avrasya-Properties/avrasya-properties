import { describe, it, expect } from "bun:test";
import { getSourceManifest, getSourceStats } from "../importer/source-manifest";
import { generateReconciliationReport } from "../importer/reconciler";
import { runImportEngine } from "../importer/import-engine";

describe("Source Data Importer & Reconciler Suite", () => {
  it("loads source manifest with expected baseline structure", () => {
    const manifest = getSourceManifest();
    const stats = getSourceStats();

    expect(stats.totalFolders).toBe(7);
    expect(stats.totalFiles).toBe(30);
    expect(stats.imageCount).toBe(28);
    expect(stats.pdfCount).toBe(1);
    expect(stats.videoCount).toBe(1);
    expect(stats.uniqueHashCount).toBe(29);
  });

  it("generates reconciliation report verifying all files are accounted for", () => {
    const report = generateReconciliationReport();

    expect(report.manifestActual.sourceFilesCount).toBe(30);
    expect(report.manifestActual.uniqueHashesCount).toBe(29);
    expect(report.manifestActual.editorialRecordsCount).toBe(18);
    expect(report.manifestActual.legacyRecordsCount).toBe(4);
    expect(report.matchStatus.sourceFilesMatch).toBe(true);
    expect(report.matchStatus.hashesMatch).toBe(true);
    expect(report.matchStatus.recordsMatch).toBe(true);
  });

  it("runs import engine dry-run and generates non-destructive SQL statements", () => {
    const dryRunResult = runImportEngine({ dryRun: true });

    expect(dryRunResult.dryRun).toBe(true);
    expect(dryRunResult.filesPlanned).toBe(30);
    expect(dryRunResult.candidatesPlanned).toBe(30);
    expect(dryRunResult.sqlStatements.length).toBeGreaterThan(0);
    // Verifies NO destructive statements
    for (const sql of dryRunResult.sqlStatements) {
      expect(sql.toUpperCase()).not.toContain("DROP TABLE");
      expect(sql.toUpperCase()).not.toContain("TRUNCATE");
    }
  });
});
