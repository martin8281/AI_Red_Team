from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class WorkflowTransitionRequest(BaseModel):
    next_state: str = Field(..., description="PLANNING, SCOPING, ASSESSMENT, ANALYSIS, REMEDIATION, REPORTING, COMPLETED, ARCHIVED")

class RemediationUpdateRequest(BaseModel):
    remediation_status: str = Field(..., description="NOT_STARTED, IN_PROGRESS, FIXED, VERIFIED, REJECTED")
    resolution_notes: Optional[str] = None
    assigned_user: Optional[str] = None
    due_date: Optional[str] = None

class EvidenceVerificationRequest(BaseModel):
    status: str = Field(..., description="UNREVIEWED, REVIEWED, VERIFIED, REJECTED")
    reviewer: str = "Alex Vance"

class NextActionResponse(BaseModel):
    title: str
    reason: str
    urgency: str
    action_url: str
    action_label: str
