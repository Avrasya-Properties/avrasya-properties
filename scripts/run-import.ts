import { buildImportSql } from "../backend/importer/import-engine";
import { generateReconciliationReport } from "../backend/importer/reconciler";
import fs from "node:fs";

const isDryRun = process.argv.includes("--dry-run");

const { sql, result } = buildImportSql(undefined, isDryRun);

console.log(`=== Avrasya Properties Source Importer ===`);
console.log(`Mode: ${isDryRun ? "DRY RUN" : "FULL IMPORT"}`);
console.log(`Source Files in Scope: ${result.totalSources}`);
console.log(`Unique Image Hashes: ${result.reconciliation.baseline.unique_image_hashes}`);
console.log(
  `Duplicate Hashes Found: ${result.reconciliation.manifestActual.duplicateHashes.length}`,
);
console.log(`Editorial Offers: ${result.importedOffers}`);
console.log(`Legacy Unconfirmed Records Preserved: ${result.legacyOffers}`);
console.log(`Projects Initialized: ${result.projectsCount}`);
console.log(`Generated SQL Statements: ${result.sqlStatements.length}`);

// Write SQL to scratch file so it can be reviewed and executed
fs.writeFileSync("backend/importer/generated_import.sql", sql, "utf-8");
console.log(`Saved generated SQL to backend/importer/generated_import.sql`);
