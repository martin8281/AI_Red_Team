# AI Red Team Assistant — Enterprise Backup & Disaster Recovery SOP

This document outlines the standard operating procedures (SOP) for backing up, verifying, and restoring relational project data, `pgvector` knowledge embeddings, evidence artifacts, and report archives.

---

## 1. Backup Schedule & Retention Policy

| Data Asset | Storage Location | Backup Frequency | Retention Period | Backup Method |
| :--- | :--- | :---: | :---: | :--- |
| **Relational Database** | PostgreSQL (`redteam_db`) | Daily (02:00 UTC) | 90 Days | `pg_dump` with custom compressed format (`.dump`) |
| **pgvector Knowledge Embeddings** | PostgreSQL (`knowledge_chunks`) | Weekly | 180 Days | `pg_dump -t knowledge_*` snapshot |
| **Evidence & PoC Artifacts** | Local / S3 Encrypted Bucket | Daily Incremental | Engagement Duration + 365 Days | AES-256 GCM encrypted tar archive |
| **Compiled Reports & Deliverables** | Generated `dist/reports/` | Real-time on publish | 7 Years (Audit Compliance) | Immutable versioned document store |

---

## 2. Automated PostgreSQL & pgvector Backup Script

```bash
#!/usr/bin/env bash
# backup_database.sh — Daily automated database backup

set -euo pipefail

BACKUP_DIR="/var/backups/redteam"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/redteam_db_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting PostgreSQL pgvector backup..."
docker exec -t redteam_postgres_vector pg_dump -U redteam_user -d redteam_db -Fc -f "/tmp/backup.dump"
docker cp redteam_postgres_vector:/tmp/backup.dump "${BACKUP_FILE}"
docker exec -t redteam_postgres_vector rm "/tmp/backup.dump"

# Encrypt backup archive with GPG
gpg --batch --yes --passphrase-file /etc/redteam/backup_passphrase.key -c "${BACKUP_FILE}"
rm "${BACKUP_FILE}"

echo "[SUCCESS] Encrypted backup created: ${BACKUP_FILE}.gpg"
```

---

## 3. Disaster Recovery & Restoration Procedure

### Step 1: Initialize Clean Database Container
```bash
docker-compose down -v
docker-compose up -d postgres_vector
```

### Step 2: Decrypt & Restore Database Dump
```bash
# Decrypt backup archive
gpg --batch --yes --passphrase-file /etc/redteam/backup_passphrase.key -d /var/backups/redteam/redteam_db_LATEST.dump.gpg > /tmp/restore.dump

# Copy and restore inside PostgreSQL container
docker cp /tmp/restore.dump redteam_postgres_vector:/tmp/restore.dump
docker exec -i redteam_postgres_vector pg_restore -U redteam_user -d redteam_db --clean --if-exists /tmp/restore.dump
docker exec -i redteam_postgres_vector rm /tmp/restore.dump
rm /tmp/restore.dump

echo "[SUCCESS] Database restoration complete. Verify health at http://localhost:8000/health"
```

---

## 4. Disaster Recovery Verification Checklist

- [x] Verify table row counts match pre-disaster state: `SELECT count(*) FROM findings;`
- [x] Verify `pgvector` extension is active: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- [x] Verify API health endpoint: `curl -f http://localhost:8000/health`
- [x] Verify AI Co-Pilot retrieval: Test RAG search on `/knowledge/search`
