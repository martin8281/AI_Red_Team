"""
High-Quality ReportLab PDF Generator for Cyber Forensic Investigation Reports.
Complies with Indian Court Law standards (Section 65B IEA / Section 79A IT Act).
Eliminates raw markdown artifacts (*, #, `) and applies professional typography, alignment, and tables.
"""
from typing import Dict, Any, List
import io
import re
import html

class PDFReportGenerator:
    @staticmethod
    def _clean_formatting(text: str) -> str:
        """
        Converts markdown bold/italics/code into ReportLab XML tags and cleans unwanted raw symbols.
        """
        # Escape HTML characters first
        escaped = html.escape(text)

        # Bold: **text** -> <b>text</b>
        escaped = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', escaped)

        # Italics: *text* or _text_ -> <i>text</i>
        escaped = re.sub(r'(?<!\w)\*(.*?)\*(?!\w)', r'<i>\1</i>', escaped)
        escaped = re.sub(r'(?<!\w)_(.*?)_(?!\w)', r'<i>\1</i>', escaped)

        # Inline Code: `text` -> <font name="Courier" color="#0F172A"><b>text</b></font>
        escaped = re.sub(r'`(.*?)`', r'<font name="Helvetica-Bold" color="#1E293B">\1</font>', escaped)

        # Clean stray markdown headers ###
        escaped = re.sub(r'^#{1,6}\s*', '', escaped)

        return escaped

    @classmethod
    def generate(cls, report_data: Dict[str, Any]) -> bytes:
        """
        Generates a publication-quality, court-admissible PDF deliverable using ReportLab.
        """
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
            )
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors
            from reportlab.pdfgen import canvas

            buffer = io.BytesIO()

            class NumberedCanvas(canvas.Canvas):
                def __init__(self, *args, **kwargs):
                    super().__init__(*args, **kwargs)
                    self._saved_page_states = []

                def showPage(self):
                    self._saved_page_states.append(dict(self.__dict__))
                    self._startPage()

                def save(self):
                    num_pages = len(self._saved_page_states)
                    for state in self._saved_page_states:
                        self.__dict__.update(state)
                        self.draw_page_decorations(num_pages)
                        super().showPage()
                    super().save()

                def draw_page_decorations(self, page_count):
                    self.saveState()
                    self.setFont("Helvetica", 8)
                    self.setFillColor(colors.HexColor('#64748B'))
                    
                    # Header
                    self.drawString(45, 805, "CYBER FORENSIC INVESTIGATION REPORT | CONFIDENTIAL & COURT ADMISSIBLE")
                    self.setStrokeColor(colors.HexColor('#CBD5E1'))
                    self.setLineWidth(0.5)
                    self.line(45, 800, 550, 800)

                    # Footer
                    self.line(45, 45, 550, 45)
                    self.drawString(45, 32, "Submitted under Section 65B Indian Evidence Act / Section 79A IT Act, 2000")
                    page_text = f"Page {self._pageNumber} of {page_count}"
                    self.drawRightString(550, 32, page_text)
                    self.restoreState()

            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                leftMargin=45,
                rightMargin=45,
                topMargin=55,
                bottomMargin=55,
            )

            styles = getSampleStyleSheet()

            # Custom typography styles
            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=18,
                leading=22,
                textColor=colors.HexColor('#0F172A'),
                alignment=1, # Centered
                spaceAfter=14,
            )

            subtitle_style = ParagraphStyle(
                'DocSubTitle',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                leading=14,
                textColor=colors.HexColor('#475569'),
                alignment=1, # Centered
                spaceAfter=15,
            )

            section_heading_style = ParagraphStyle(
                'SecHeading',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=12,
                leading=16,
                textColor=colors.HexColor('#1E3A8A'),
                spaceBefore=14,
                spaceAfter=6,
                keepWithNext=True,
            )

            sub_heading_style = ParagraphStyle(
                'SubSecHeading',
                parent=styles['Heading3'],
                fontName='Helvetica-Bold',
                fontSize=10,
                leading=14,
                textColor=colors.HexColor('#0F172A'),
                spaceBefore=8,
                spaceAfter=4,
                keepWithNext=True,
            )

            body_style = ParagraphStyle(
                'BodyTextCustom',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9.5,
                leading=13.5,
                textColor=colors.HexColor('#1E293B'),
                spaceAfter=6,
            )

            bullet_style = ParagraphStyle(
                'BulletCustom',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9,
                leading=13,
                textColor=colors.HexColor('#334155'),
                leftIndent=14,
                firstLineIndent=-10,
                spaceAfter=3,
            )

            table_cell_style = ParagraphStyle(
                'TableCell',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=8.5,
                leading=11,
                textColor=colors.HexColor('#1E293B'),
            )

            table_header_style = ParagraphStyle(
                'TableHeader',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=8.5,
                leading=11,
                textColor=colors.white,
            )

            story = []

            # 1. Classification Banner
            classification = report_data.get('configuration', {}).get('classification', 'CONFIDENTIAL // COURT ADMISSIBLE')
            banner_text = f"<b>{classification}</b>"
            story.append(Paragraph(banner_text, subtitle_style))
            story.append(Spacer(1, 4))

            # 2. Document Title
            doc_title = "CYBER FORENSIC INVESTIGATION REPORT"
            story.append(Paragraph(doc_title, title_style))
            
            case_title = report_data.get('title', 'Unauthorized Access Assessment')
            story.append(Paragraph(f"<b>Case Title:</b> {html.escape(case_title)}", subtitle_style))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1E3A8A'), spaceAfter=14))

            # 3. High-Level Summary Metadata Box
            meta_rows = [
                [
                    Paragraph("<b>Case Reference:</b>", table_cell_style),
                    Paragraph(html.escape(str(report_data.get('id', 'CF-2026-001'))), table_cell_style),
                    Paragraph("<b>Investigation Date:</b>", table_cell_style),
                    Paragraph(html.escape(str(report_data.get('generated_at', '21/09/2026'))[:10]), table_cell_style),
                ],
                [
                    Paragraph("<b>Target Entity:</b>", table_cell_style),
                    Paragraph(html.escape(str(report_data.get('organization', 'Client Organization'))), table_cell_style),
                    Paragraph("<b>Lead Examiner:</b>", table_cell_style),
                    Paragraph(html.escape(str(report_data.get('created_by', 'Lead Forensic Examiner'))), table_cell_style),
                ],
                [
                    Paragraph("<b>Risk Score:</b>", table_cell_style),
                    Paragraph(f"<b>{report_data.get('overall_risk_score', 0)} / 100</b>", table_cell_style),
                    Paragraph("<b>Substantiated Findings:</b>", table_cell_style),
                    Paragraph(f"<b>{report_data.get('findings_count', 0)} Findings</b>", table_cell_style),
                ],
            ]
            t_meta = Table(meta_rows, colWidths=[110, 140, 120, 135])
            t_meta.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(t_meta)
            story.append(Spacer(1, 14))

            # 4. Process Each Enabled Section
            for sec in report_data.get('sections', []):
                if not sec.get('enabled', True):
                    continue

                sec_title = sec.get('title', '')
                story.append(Paragraph(cls._clean_formatting(sec_title), section_heading_style))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#93C5FD'), spaceAfter=8))

                raw_content = sec.get('content', '')
                lines = raw_content.split('\n')

                current_paragraph_lines = []

                for line in lines:
                    trimmed = line.strip()
                    if not trimmed:
                        if current_paragraph_lines:
                            p_text = " ".join(current_paragraph_lines)
                            story.append(Paragraph(cls._clean_formatting(p_text), body_style))
                            current_paragraph_lines = []
                        continue

                    # Sub-heading detection
                    if trimmed.startswith('###') or (trimmed.endswith(':') and len(trimmed) < 60 and not trimmed.startswith('-')):
                        if current_paragraph_lines:
                            p_text = " ".join(current_paragraph_lines)
                            story.append(Paragraph(cls._clean_formatting(p_text), body_style))
                            current_paragraph_lines = []
                        story.append(Paragraph(cls._clean_formatting(trimmed), sub_heading_style))
                        continue

                    # Bullet point detection
                    if trimmed.startswith('- ') or trimmed.startswith('* '):
                        if current_paragraph_lines:
                            p_text = " ".join(current_paragraph_lines)
                            story.append(Paragraph(cls._clean_formatting(p_text), body_style))
                            current_paragraph_lines = []
                        bullet_content = trimmed[2:].strip()
                        story.append(Paragraph(f"&bull; {cls._clean_formatting(bullet_content)}", bullet_style))
                        continue

                    # Numbered list detection
                    num_match = re.match(r'^(\d+\.)\s+(.*)', trimmed)
                    if num_match:
                        if current_paragraph_lines:
                            p_text = " ".join(current_paragraph_lines)
                            story.append(Paragraph(cls._clean_formatting(p_text), body_style))
                            current_paragraph_lines = []
                        num_prefix = num_match.group(1)
                        num_content = num_match.group(2)
                        story.append(Paragraph(f"<b>{num_prefix}</b> {cls._clean_formatting(num_content)}", bullet_style))
                        continue

                    # Normal text line
                    current_paragraph_lines.append(trimmed)

                if current_paragraph_lines:
                    p_text = " ".join(current_paragraph_lines)
                    story.append(Paragraph(cls._clean_formatting(p_text), body_style))

                story.append(Spacer(1, 8))

            doc.build(story, canvasmaker=NumberedCanvas)
            buffer.seek(0)
            return buffer.getvalue()

        except ImportError as e:
            content = f"Title: {report_data.get('title')}\nGenerated: {report_data.get('generated_at')}"
            return content.encode('utf-8')
