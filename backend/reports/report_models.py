from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ReportSectionModel(BaseModel):
    id: str
    section_type: str
    title: str
    content: str
    order: int
    enabled: bool = True
    is_ai_generated: bool = False

class ReportConfigurationModel(BaseModel):
    include_evidence: bool = True
    include_ai_summary: bool = True
    include_ai_remediation: bool = True
    include_ai_conclusion: bool = True
    enabled_sections: List[str]
    classification: str = "CONFIDENTIAL // RESTRICTED ACCESS"
    lead_auditor: str = "Alex Vance"

class ReportModel(BaseModel):
    id: str
    project_id: str
    project_name: Optional[str] = None
    organization: Optional[str] = None
    created_by: str
    title: str
    report_type: str
    status: str = "READY"
    version: str = "v1.0"
    configuration: ReportConfigurationModel
    sections: List[ReportSectionModel]
    findings_count: int = 0
    critical_count: int = 0
    high_count: int = 0
    overall_risk_score: int = 0
    generated_at: Optional[str] = None
    created_at: str
    updated_at: str
