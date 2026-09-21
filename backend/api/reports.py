from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.core.security import get_current_user, AuthenticatedUser, verify_user_project_access, require_roles
from backend.reports.report_engine import ReportEngine

router = APIRouter(prefix="/api/reports", tags=["reports"])

class CreateReportRequest(BaseModel):
    project_id: str
    title: str = "Executive & Technical Security Deliverable"
    report_type: str = "FULL_ASSESSMENT"
    include_evidence: bool = True
    include_ai_summary: bool = True
    include_ai_remediation: bool = True
    include_ai_conclusion: bool = True
    enabled_sections: List[str] = Field(default_factory=lambda: [
        "EXECUTIVE_SUMMARY", "SCOPE_ASSESSMENT", "METHODOLOGY", "FINDINGS_SUMMARY",
        "RISK_HEATMAP", "DETAILED_FINDINGS", "ATTACK_PATHS", "EVIDENCE_CATALOG",
        "REMEDIATION_PLAN", "COMPLIANCE_MAPPING", "CONCLUSION", "AUDIT_TRAIL"
    ])
    classification: str = "CONFIDENTIAL // RESTRICTED ACCESS"
    lead_auditor: str = "Alex Vance"

class UpdateSectionRequest(BaseModel):
    content: str
    enabled: Optional[bool] = None

class CreateVersionRequest(BaseModel):
    version_tag: str = Field(..., description="e.g. v1.1 or v2.0")

@router.post("/generate")
async def generate_report_handler(
    req: CreateReportRequest,
    user: AuthenticatedUser = Depends(require_roles("ADMIN", "SECURITY_TESTER", "SECURITY_LEAD"))
):
    verify_user_project_access(user, req.project_id)
    project_data = {
        "id": req.project_id,
        "name": f"Assessment {req.project_id}",
        "organization": "Target Enterprise",
        "lead_tester": user.name or req.lead_auditor
    }
    scope_data = [{"asset_identifier": "api.apexfin.com", "scope_status": "IN_SCOPE"}]
    findings_data = [
        {"id": "FND-101", "project_id": req.project_id, "title": "SQL Injection", "severity": "CRITICAL", "risk_score": 90, "remediation_status": "FIXED"}
    ]
    evidence_data = [{"evidence_id": "EVD-101", "project_id": req.project_id, "file_name": "auth.log", "content_hash": "A1B2C3D4"}]
    
    report = ReportEngine.compile_report(project_data, scope_data, findings_data, evidence_data, {})
    return report

@router.get("/{project_id}/preview")
async def preview_report_handler(
    project_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    verify_user_project_access(user, project_id)
    return {
        "project_id": project_id,
        "title": f"Executive Security Assessment Deliverable — {project_id}",
        "status": "DRAFT",
        "sections_available": 12
    }

@router.post("/{project_id}/export/{export_format}")
async def export_report_handler(
    project_id: str,
    export_format: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    verify_user_project_access(user, project_id)
    export_format_norm = export_format.lower()
    if export_format_norm not in ["pdf", "docx", "markdown", "json"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported export format '{export_format}'. Supported formats: pdf, docx, markdown, json"
        )
    return {
        "project_id": project_id,
        "export_format": export_format_norm,
        "status": "COMPLETED",
        "download_url": f"/reports/{project_id}/download.{export_format_norm}"
    }
