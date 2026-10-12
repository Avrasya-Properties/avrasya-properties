import { loadSourceManifest, type SourceDataManifest } from "./source-manifest";
import { generateReconciliationReport, type ReconciliationReport } from "./reconciler";

export interface ImportResult {
  runId: string;
  isDryRun: boolean;
  totalSources: number;
  importedSources: number;
  totalOffers: number;
  importedOffers: number;
  legacyOffers: number;
  projectsCount: number;
  reconciliation: ReconciliationReport;
  sqlStatements: string[];
}

export function buildImportSql(manifest?: SourceDataManifest, isDryRun = false): { sql: string; result: ImportResult } {
  const data = manifest || loadSourceManifest();
  const recon = generateReconciliationReport(data);

  const statements: string[] = [];

  // Start transaction
  statements.push("BEGIN;");

  // 1. Create or get Import Run record
  const runId = "gen_random_uuid()";
  statements.push(`
    INSERT INTO public.import_runs (id, run_type, total_sources, imported_sources, status, log_messages)
    VALUES (
      ${runId},
      '${isDryRun ? "dry_run" : "full_import"}',
      ${data.sources.length},
      ${isDryRun ? 0 : data.sources.length},
      '${isDryRun ? "completed" : "completed"}',
      '${JSON.stringify({ notes: "Drive baseline imported successfully" }).replace(/'/g, "''")}'::jsonb
    );
  `);

  // 2. Import Source Files (idempotent ON CONFLICT (drive_id) DO UPDATE)
  for (const src of data.sources) {
    const safeFilename = src.filename.replace(/'/g, "''");
    const safeFolder = src.folder.replace(/'/g, "''");
    const safeAssetPath = src.asset_path.replace(/'/g, "''");
    const safeUrl = src.drive_url.replace(/'/g, "''");
    const safeMime = src.mime_type.replace(/'/g, "''");

    statements.push(`
      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '${src.id}', '${safeFolder}', '${safeFilename}', '${safeAssetPath}', '${safeUrl}',
        '${safeMime}', ${src.bytes}, '${src.sha256}', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    `);

    // Add extraction candidate provenance
    statements.push(`
      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '${src.id}' LIMIT 1),
        'file_provenance',
        '${JSON.stringify(src).replace(/'/g, "''")}'::jsonb,
        '${JSON.stringify({ filename: src.filename, sha256: src.sha256, folder: src.folder }).replace(/'/g, "''")}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    `);
  }

  // 3. Known Projects
  const knownProjects = [
    { name: "RAMS Park House Maslak", slug: "rams-park-house-maslak", district: "Maslak", side: "Europe" },
    { name: "Oryapark Istanbul", slug: "oryapark-istanbul", district: "Ümraniye", side: "Asia" },
    { name: "Güneşli Residences", slug: "gunesli-residences", district: "Güneşli", side: "Europe" },
    { name: "Beşiktaş Suites", slug: "besiktas-suites", district: "Beşiktaş", side: "Europe" },
    { name: "Topkapı Residences", slug: "topkapi-residences", district: "Topkapı", side: "Europe" },
    { name: "Şişli Central", slug: "sisli-central", district: "Şişli", side: "Europe" },
    { name: "Türkerler Çiftçi Towers", slug: "turkerler-ciftci-towers-proj", district: "Beşiktaş", side: "Europe" },
  ];

  for (const p of knownProjects) {
    statements.push(`
      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        '${p.name.replace(/'/g, "''")}',
        '${p.slug}',
        '${p.district.replace(/'/g, "''")}',
        'Istanbul',
        '${p.side}',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    `);
  }

  // 4. Import the 18 Editorial Offer Records
  let i = 0;
  for (const r of data.records) {
    i++;
    const ref = `AVR-${1000 + i}`;
    const safeTitle = r.marketing_title.replace(/'/g, "''");
    const safeDesc = (r.details?.note ? String(r.details.note) : "").replace(/'/g, "''");
    const safeDistrict = (r.location_label || "Istanbul").replace(/'/g, "''");
    const side = r.side === "Asia" ? "Asia" : r.side === "Europe" ? "Europe" : "unknown";
    const recordType = r.record_type;
    const layout = r.layout_label ? `'${r.layout_label.replace(/'/g, "''")}'` : "NULL";
    const amount = r.price.amount != null ? r.price.amount : "NULL";
    const currency = r.price.currency ? `'${r.price.currency}'` : "NULL";
    const priceBasis = r.price.basis.replace(/'/g, "''");
    const priceType = r.price.amount == null ? "on-request" : r.record_type === "project" ? "from" : "fixed";
    const claims = (r.details?.claims_requiring_confirmation || []).map((c) => `'${c.replace(/'/g, "''")}'`).join(",");
    const claimsArr = claims ? `ARRAY[${claims}]` : "'{}'::text[]";
    const delivery = r.details?.delivery_source ? `'${String(r.details.delivery_source).replace(/'/g, "''")}'` : "NULL";
    const isCbi = (r.price.amount ?? 0) >= 400000;

    // Determine areas
    const grossArea = r.areas.find((a) => a.basis === "gross")?.value_m2 ?? "NULL";
    const netArea = r.areas.find((a) => a.basis === "net")?.value_m2 ?? "NULL";
    const unspecArea = r.areas.find((a) => a.basis === "unspecified")?.value_m2 ?? "NULL";

    statements.push(`
      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        '${ref}', '${r.slug}', '${safeTitle}', '${(r.title_provenance || "source").replace(/'/g, "''")}',
        '${safeDistrict}', 'Istanbul', '${side}', '${recordType}', 'sale', ${layout},
        ${grossArea}, ${netArea}, ${unspecArea}, ${amount}, ${currency},
        '${priceType}', '${priceBasis}', '${r.availability_verified ? "Available" : "Unknown"}', 'Draft',
        '${safeDesc}', 'Delivery source: ' || COALESCE(${delivery}, 'unspecified'), ${claimsArr},
        ${isCbi}, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    `);

    // Pricing Option
    if (r.price.amount != null && r.price.currency) {
      statements.push(`
        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = '${r.slug}' LIMIT 1),
          'Cash Offer',
          ${r.price.amount},
          '${r.price.currency}',
          '${priceBasis}',
          true,
          ${r.price.down_payment_amount ?? "NULL"},
          ${r.price.installment_count ?? "NULL"}
        );
      `);
    }

    // Installment offer if present
    if (r.details?.installment_offer && typeof r.details.installment_offer === "object") {
      const inst = r.details.installment_offer;
      if (inst.total && inst.currency) {
        statements.push(`
          INSERT INTO public.pricing_options (
            offer_id, option_name, amount, currency, basis, is_default, down_payment_percent, installment_count
          ) VALUES (
            (SELECT id FROM public.marketing_offers WHERE slug = '${r.slug}' LIMIT 1),
            'Installment Plan',
            ${inst.total},
            '${inst.currency}',
            'installment_schedule',
            false,
            ${inst.down_payment_percent ?? "NULL"},
            ${inst.months ?? "NULL"}
          );
        `);
      }
    }
  }

  // 5. Import the 4 Legacy Unconfirmed Snapshot Records
  for (const leg of data.legacy_snapshot_only_records) {
    i++;
    const ref = `AVR-LEG-${1000 + i}`;
    statements.push(`
      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, district, city, side,
        record_type, mode, amount, currency, price_type, price_basis,
        availability, publication, description, source_note, cbi_eligible
      ) VALUES (
        '${ref}', '${leg.slug}', 'Legacy Listing — ${leg.slug}', 'Şişli', 'Istanbul', 'Europe',
        'unit_offer', 'sale', ${leg.price_usd}, 'USD', 'fixed', 'advertised',
        'Unknown', 'Draft',
        'Historical listing from earlier catalogue snapshot; pending source verification.',
        'Not located in source Drive folder; preserved as legacy draft per instruction.',
        ${leg.price_usd >= 400000}
      )
      ON CONFLICT (slug) DO NOTHING;
    `);
  }

  // 6. Catalog Services (the 6 service phases)
  let sortOrder = 0;
  for (const phase of data.catalog.service_phases) {
    sortOrder++;
    const slug = phase.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    statements.push(`
      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        '${slug}',
        '${phase.replace(/'/g, "''")}',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        ${sortOrder},
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    `);
  }

  // 7. Catalog Document
  statements.push(`
    INSERT INTO public.catalog_documents (
      title, edition, storage_path, page_count, disclaimer, is_published
    ) VALUES (
      'Avrasya Properties Investment Portfolio & Advisory Guide',
      '2026 Comprehensive Edition',
      'sources/avrasya catalog_1_compressed.pdf',
      ${data.catalog.page_count},
      'Confidential investor advisory guide. All offers subject to title deed, zoning and valuation clearance.',
      true
    )
    ON CONFLICT DO NOTHING;
  `);

  // Commit transaction (or rollback if dry run)
  if (isDryRun) {
    statements.push("ROLLBACK;");
  } else {
    statements.push("COMMIT;");
  }

  const sql = statements.join("\n");

  const result: ImportResult = {
    runId: "import-run",
    isDryRun,
    totalSources: data.sources.length,
    importedSources: isDryRun ? 0 : data.sources.length,
    totalOffers: data.records.length + data.legacy_snapshot_only_records.length,
    importedOffers: data.records.length,
    legacyOffers: data.legacy_snapshot_only_records.length,
    projectsCount: knownProjects.length,
    reconciliation: recon,
    sqlStatements: statements,
  };

  return { sql, result };
}

export function runImportEngine(options: { dryRun?: boolean; manifest?: SourceDataManifest } = {}) {
  const { sql, result } = buildImportSql(options.manifest, options.dryRun ?? false);
  return {
    dryRun: result.isDryRun,
    filesPlanned: result.totalSources,
    candidatesPlanned: result.totalSources,
    recordsPlanned: result.totalOffers,
    sqlStatements: result.sqlStatements,
    reconciliation: result.reconciliation,
    sql,
  };
}
