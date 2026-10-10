import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("src/data/source.json", "utf8"));

const candidateRows = manifest.sources.map((s) => {
  const rawPayload = JSON.stringify(s).replace(/'/g, "''");
  const normPayload = JSON.stringify({ filename: s.filename, sha256: s.sha256, folder: s.folder }).replace(/'/g, "''");
  return `(
    (SELECT id FROM public.source_files WHERE drive_id = '${s.id}' LIMIT 1),
    'file_provenance',
    '${rawPayload}'::jsonb,
    '${normPayload}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  )`;
}).join(",\n");

const sql = `
INSERT INTO public.extraction_candidates (
  source_file_id, candidate_type, raw_payload, normalized_payload,
  extraction_method, confidence, review_status, review_notes
) VALUES
${candidateRows};
`;

fs.writeFileSync("backend/importer/clean_extraction_candidates.sql", sql, "utf8");
console.log("clean_extraction_candidates.sql written, length:", sql.length);
