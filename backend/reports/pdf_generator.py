"""
ReportLab PDF Generator for Security Assessment Deliverables.
"""
from typing import Dict, Any
import io

class PDFReportGenerator:
    @staticmethod
    def generate(report_data: Dict[str, Any]) -> bytes:
        """
        Generates a styled, audit-compliant PDF deliverable using ReportLab.
        Returns bytes buffer.
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=54,
                leftMargin=54,
                topMargin=54,
                bottomMargin=54,
            )

            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=20,
                leading=24,
                textColor=colors.HexColor('#0F172A'),
                spaceAfter=12,
            )
            heading_style = ParagraphStyle(
                'HeadingStyle',
                parent=styles['Heading2'],
                fontSize=14,
                leading=18,
                textColor=colors.HexColor('#7C3AED'),
                spaceBefore=14,
                spaceAfter=8,
            )
            body_style = ParagraphStyle(
                'BodyStyle',
                parent=styles['Normal'],
                fontSize=10,
                leading=14,
                textColor=colors.HexColor('#334155'),
                spaceAfter=8,
            )

            story = []

            # Header / Classification
            classification = report_data.get('configuration', {}).get('classification', 'CONFIDENTIAL')
            story.append(Paragraph(f"<b>[{classification}]</b>", styles['Normal']))
            story.append(Spacer(1, 10))

            # Document Title
            title = report_data.get('title', 'Security Assessment Report')
            story.append(Paragraph(title, title_style))
            story.append(Spacer(1, 14))

            # Metadata Table
            meta_data = [
                ['Engagement Type:', report_data.get('report_type', 'Penetration Testing')],
                ['Deliverable Version:', report_data.get('version', 'v1.0')],
                ['Risk Score:', f"{report_data.get('overall_risk_score', 0)} / 100"],
                ['Total Findings:', str(report_data.get('findings_count', 0))],
            ]
            t = Table(meta_data, colWidths=[150, 300])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(t)
            story.append(Spacer(1, 20))

            # Enabled Sections
            import html
            for sec in report_data.get('sections', []):
                if sec.get('enabled', True):
                    story.append(Paragraph(html.escape(sec.get('title', '')), heading_style))
                    raw_content = sec.get('content', '')
                    content_clean = html.escape(raw_content).replace('\n', '<br/>')
                    story.append(Paragraph(content_clean, body_style))
                    story.append(Spacer(1, 10))

            doc.build(story)
            buffer.seek(0)
            return buffer.getvalue()
        except ImportError:
            # Fallback if ReportLab is not pre-installed in the environment
            content = f"# {report_data.get('title')}\n\nDeliverable Version: {report_data.get('version')}"
            return content.encode('utf-8')
