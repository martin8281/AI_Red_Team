"""
DOCX Deliverable Generator using python-docx.
"""
from typing import Dict, Any
import io

class DOCXReportGenerator:
    @staticmethod
    def generate(report_data: Dict[str, Any]) -> bytes:
        """
        Generates a styled DOCX report document.
        Returns bytes buffer.
        """
        try:
            import docx
            from docx.shared import Inches, Pt, RGBColor

            doc = docx.Document()
            buffer = io.BytesIO()

            # Document Title
            title = report_data.get('title', 'Security Assessment Deliverable')
            heading = doc.add_heading(title, level=0)
            heading.style.font.color.rgb = RGBColor(15, 23, 42)

            # Metadata Table
            table = doc.add_table(rows=4, cols=2)
            table.style = 'Light Shading Accent 1'
            table.cell(0, 0).text = 'Engagement Type'
            table.cell(0, 1).text = str(report_data.get('report_type', ''))
            table.cell(1, 0).text = 'Version'
            table.cell(1, 1).text = str(report_data.get('version', ''))
            table.cell(2, 0).text = 'Risk Score'
            table.cell(2, 1).text = f"{report_data.get('overall_risk_score', 0)}/100"
            table.cell(3, 0).text = 'Total Findings'
            table.cell(3, 1).text = str(report_data.get('findings_count', 0))

            doc.add_paragraph()

            # Sections
            for sec in report_data.get('sections', []):
                if sec.get('enabled', True):
                    doc.add_heading(sec.get('title', ''), level=1)
                    doc.add_paragraph(sec.get('content', ''))

            doc.save(buffer)
            buffer.seek(0)
            return buffer.getvalue()
        except ImportError:
            content = f"Title: {report_data.get('title')}\nVersion: {report_data.get('version')}"
            return content.encode('utf-8')
