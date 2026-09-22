"""
Unit Tests for FileParserService (Universal File & Document Text Extraction).
"""
import io
import docx
import zipfile
from backend.pipeline.file_parser import FileParserService


def test_file_parser_plain_text():
    content = b"Target Endpoint: https://auth.apexfin.com/v1/login\nVulnerability: SQL Injection"
    res = FileParserService.parse_file("scan.log", content)
    assert res["category"] == "LOG"
    assert "SQL Injection" in res["content"]
    assert res["size"] == len(content)
    assert len(res["sha256"]) == 64


def test_file_parser_docx_tables_and_text():
    doc = docx.Document()
    doc.add_heading("Threat Model Deliverable", level=1)
    doc.add_paragraph("Finding: Stored XSS in comments field.")
    table = doc.add_table(rows=1, cols=2)
    table.rows[0].cells[0].text = "Asset"
    table.rows[0].cells[1].text = "Severity"
    row = table.add_row().cells
    row[0].text = "app.apexfin.com"
    row[1].text = "CRITICAL"

    buf = io.BytesIO()
    doc.save(buf)
    docx_bytes = buf.getvalue()

    res = FileParserService.parse_file("threat_model.docx", docx_bytes)
    assert res["category"] == "DOCUMENT"
    assert "Threat Model Deliverable" in res["content"]
    assert "Stored XSS" in res["content"]
    assert "app.apexfin.com" in res["content"]


def test_file_parser_zip_archive_inspection():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("server.log", "Error: Database connection refused on port 5432")
        zf.writestr("config.env", "DB_USER=admin\nDB_PASS=secret123")
    zip_bytes = buf.getvalue()

    res = FileParserService.parse_file("logs_dump.zip", zip_bytes)
    assert res["category"] == "ARCHIVE"
    assert "server.log" in res["content"]
    assert "Database connection refused" in res["content"]


def test_file_parser_truncation_limit():
    large_data = b"A" * 50000
    res = FileParserService.parse_file("large.txt", large_data)
    assert len(res["content"]) <= 41000
    assert "TRUNCATED" in res["content"]
