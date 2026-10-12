# Database & Storage Backup, Retention, and Disaster Recovery

## 1. PostgreSQL Database Backups

### Automated Backups (Supabase Managed)
- **Point-in-Time Recovery (PITR)**: Supabase provides continuous WAL archiving for Pro projects, allowing restoration to any second within the retention window (7 to 30 days).
- **Daily Physical Backups**: Retained automatically for disaster recovery.

### Manual Export / Logical Backup (`pg_dump`)
To take an offsite logical snapshot:
```bash
# Dump complete schema and data (excluding auth secrets)
pg_dump \
  --clean \
  --if-exists \
  --quote-all-identifiers \
  --no-owner \
  --no-privileges \
  --host=db.ufcpvjhzitmxgitoaolx.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=avrasya_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Logical Restore Procedure
```bash
# Restore into target database
psql \
  --host=db.ufcpvjhzitmxgitoaolx.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=avrasya_backup_20261011_000000.sql
```

---

## 2. Storage Buckets Backup & Retention

Avrasya Properties utilizes 3 distinct buckets:
- `public-marketing`
- `private-source`
- `private-documents`

### Bucket Mirroring
Use Supabase CLI or S3-compatible tools (such as `rclone` or AWS CLI with Supabase S3 credentials):
```bash
# Sync public marketing assets to cold backup
rclone sync supabase:public-marketing /backups/storage/public-marketing/

# Sync private sensitive documents
rclone sync supabase:private-documents /backups/storage/private-documents/ --crypt
```

### Retention Policy
- `public-marketing`: Retain permanently while referenced by active listings. Deletion of media referenced by published content is blocked until unpublished.
- `private-documents`: Retain minimum 7 years for financial records and contracts; archived thereafter.
- `audit_events`: Immutable server-generated records; retained indefinitely.

---

## 3. Disaster Recovery Plan

1. **Service Disruption / Corrupted Data**:
   - Assess timeline of corruption.
   - Initiate Supabase PITR to the timestamp immediately preceding the incident.
   - Run `bun test` to verify database functions and triggers are operational.
2. **Missing Media Files**:
   - Re-run import engine or restore bucket from the cold S3 mirror.
   - Missing Drive files do **NOT** automatically delete database records or unpublish listings.
