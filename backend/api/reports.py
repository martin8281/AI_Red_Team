from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class CreateReportRequest(BaseModel):
    project_id: str
    title: str
    report_type: str
    include_evidence: bool = True
    include_ai_summary: bool = True
    include_ai_remediation: bool = True
    include_ai_conclusion: bool = True
    enabled_sections: List[str]
    classification: str = "CONFIDENTIAL // RESTRICTED ACCESS"
    lead_auditor: str = "Alex Vance"

class UpdateSectionRequest(BaseModel):
    content: str
    enabled: Optional[bool] = None

class CreateVersionRequest(BaseModel):
    version_tag: str = Field(..., description="e.g. v1.1 or v2.0")
