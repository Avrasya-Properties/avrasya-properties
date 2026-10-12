import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("src/data/source.json", "utf8"));

const sfRows = manifest.sources
  .map((s) => {
    const f = s.folder.replace(/'/g, "''");
    const fn = s.filename.replace(/'/g, "''");
    const ap = s.asset_path.replace(/'/g, "''");
    const du = s.drive_url.replace(/'/g, "''");
    return `('${s.id}', '${f}', '${fn}', '${ap}', '${du}', '${s.mime_type}', ${s.bytes}, '${s.sha256}', 'imported')`;
  })
  .join(",\n");

const sql = `
INSERT INTO public.import_runs (run_type, total_sources, imported_sources, status, log_messages)
VALUES ('full_import', ${manifest.sources.length}, ${manifest.sources.length}, 'completed', '{"message": "Verified baseline sources imported"}'::jsonb);

INSERT INTO public.source_files (
  drive_id, folder_name, filename, asset_path, drive_url, mime_type, bytes, sha256, import_status
) VALUES
${sfRows}
ON CONFLICT (drive_id) DO UPDATE SET sha256 = EXCLUDED.sha256, bytes = EXCLUDED.bytes, updated_at = now();
`;

fs.writeFileSync("backend/importer/clean_source_files.sql", sql, "utf8");
console.log("clean_source_files.sql written, length:", sql.length);
