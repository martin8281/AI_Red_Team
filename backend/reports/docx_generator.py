"""
DOCX Deliverable Generator for Court-Admissible Cyber Forensic Reports.
Formats clean Microsoft Word documents with structured tables, proper font sizes, and zero raw markdown symbols.
"""
from typing import Dict, Any
import io
import re

class DOCXReportGenerator:
    @staticmethod
    def _strip_markdown_symbols(text: str) -> str:
        """
        Removes raw markdown characters while preserving readable content.
        """
        cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        cleaned = re.sub(r'\*(.*?)\*', r'\1', cleaned)
        cleaned = re.sub(r'`(.*?)`', r'\1', cleaned)
        cleaned = re.sub(r'^#{1,6}\s*', '', cleaned)
        return cleaned

    @classmethod
    def generate(cls, report_data: Dict[str, Any]) -> bytes:
        """
        Generates a styled, professional DOCX report document.
        """
        try:
            import docx
            from docx.shared import Inches, Pt, RGBColor
            from docx.enum.text import WD_ALIGN_PARAGRAPH
            from docx.enum.table import WD_TABLE_ALIGNMENT

            doc = docx.Document()
            buffer = io.BytesIO()

            # Set Margins
            sections_doc = doc.sections
            for s in sections_doc:
                s.top_margin = Inches(0.8)
                s.bottom_margin = Inches(0.8)
                s.left_margin = Inches(0.9)
                s.right_margin = Inches(0.9)

            # 1. Classification & Document Title
            classification = report_data.get('configuration', {}).get('classification', 'CONFIDENTIAL // COURT ADMISSIBLE')
            p_class = doc.add_paragraph()
            p_class.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run_class = p_class.add_run(f"[{classification}]")
            run_class.bold = True
            run_class.font.size = Pt(10)
            run_class.font.color.rgb = RGBColor(71, 85, 105)

            p_title = doc.add_paragraph()
            p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run_title = p_title.add_run("CYBER FORENSIC INVESTIGATION REPORT")
            run_title.bold = True
            run_title.font.size = Pt(18)
            run_title.font.color.rgb = RGBColor(15, 23, 42)

            case_title = report_data.get('title', 'Unauthorized Access Assessment')
            p_case = doc.add_paragraph()
            p_case.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run_case = p_case.add_run(f"Case Title: {case_title}")
            run_case.bold = True
            run_case.font.size = Pt(11)
            run_case.font.color.rgb = RGBColor(30, 58, 138)

            doc.add_paragraph()

            # 2. Case Summary Metadata Table
            table = doc.add_table(rows=4, cols=2)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.style = 'Light Shading Accent 1'

            meta_data = [
                ("Case Identifier:", str(report_data.get('id', 'CF-2026-001'))),
                ("Target Entity / Client:", str(report_data.get('organization', 'Client Organization'))),
                ("Lead Forensic Examiner:", str(report_data.get('created_by', 'Martin Thomas'))),
                ("Deterministic Risk Posture:", f"{report_data.get('overall_risk_score', 0)} / 100 ({report_data.get('findings_count', 0)} Findings)"),
            ]

            for idx, (label, val) in enumerate(meta_data):
                cell_0 = table.cell(idx, 0)
                cell_1 = table.cell(idx, 1)
                cell_0.text = label
                cell_1.text = val
                cell_0.paragraphs[0].runs[0].bold = True
                cell_0.paragraphs[0].runs[0].font.size = Pt(9.5)
                cell_1.paragraphs[0].runs[0].font.size = Pt(9.5)

            doc.add_paragraph()

            # 3. Process Report Sections
            for sec in report_data.get('sections', []):
                if not sec.get('enabled', True):
                    continue

                sec_title = sec.get('title', '')
                h1 = doc.add_heading(sec_title, level=1)
                h1.style.font.size = Pt(13)
                h1.style.font.color.rgb = RGBColor(30, 58, 138)
                h1.style.font.bold = True

                raw_content = sec.get('content', '')
                lines = raw_content.split('\n')

                for line in lines:
                    trimmed = line.strip()
                    if not trimmed:
                        continue

                    # Sub-heading
                    if trimmed.startswith('###') or (trimmed.endswith(':') and len(trimmed) < 60 and not trimmed.startswith('-')):
                        clean_h = cls._strip_markdown_symbols(trimmed)
                        h2 = doc.add_paragraph()
                        r = h2.add_run(clean_h)
                        r.bold = True
                        r.font.size = Pt(10.5)
                        r.font.color.rgb = RGBColor(15, 23, 42)
                        continue

                    # Bullet item
                    if trimmed.startswith('- ') or trimmed.startswith('* '):
                        bullet_text = cls._strip_markdown_symbols(trimmed[2:])
                        p_bullet = doc.add_paragraph(style='List Bullet')
                        p_bullet.add_run(bullet_text).font.size = Pt(9.5)
                        continue

                    # Normal paragraph
                    clean_p = cls._strip_markdown_symbols(trimmed)
                    p_norm = doc.add_paragraph()
                    r_norm = p_norm.add_run(clean_p)
                    r_norm.font.size = Pt(9.5)
                    r_norm.font.color.rgb = RGBColor(30, 41, 59)

                doc.add_paragraph()

            doc.save(buffer)
            buffer.seek(0)
            return buffer.getvalue()

        except ImportError:
            content = f"Title: {report_data.get('title')}\nGenerated: {report_data.get('generated_at')}"
            return content.encode('utf-8')
