from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.core.security import get_current_user, AuthenticatedUser, verify_user_project_access, require_roles
from backend.workspace.progress_calculator import ProgressCalculator
from backend.workspace.health_evaluator import HealthEvaluator

router = APIRouter(prefix="/api/workspace", tags=["workspace"])

VALID_TRANSITIONS = {
    "PLANNING": ["SCOPING"],
    "SCOPING": ["ASSESSMENT"],
    "ASSESSMENT": ["ANALYSIS"],
    "ANALYSIS": ["REMEDIATION", "REPORTING"],
    "REMEDIATION": ["REPORTING", "ASSESSMENT"],
    "REPORTING": ["COMPLETED"],
    "COMPLETED": ["ARCHIVED"],
    "ARCHIVED": []
}

class WorkflowTransitionRequest(BaseModel):
    current_state: str = Field("PLANNING", description="Current workflow state")
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

@router.post("/{project_id}/transition")
async def transition_workflow_handler(
    project_id: str,
    req: WorkflowTransitionRequest,
    user: AuthenticatedUser = Depends(require_roles("ADMIN", "SECURITY_TESTER", "SECURITY_LEAD"))
):
    verify_user_project_access(user, project_id)
    allowed_next = VALID_TRANSITIONS.get(req.current_state, [])
    if req.next_state not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid workflow transition: Cannot transition from '{req.current_state}' to '{req.next_state}'. Allowed transitions: {allowed_next}"
        )
    return {
        "project_id": project_id,
        "previous_state": req.current_state,
        "new_state": req.next_state,
        "status": "ADVANCED"
    }

@router.patch("/{project_id}/remediation/{finding_id}")
async def update_remediation_handler(
    project_id: str,
    finding_id: str,
    req: RemediationUpdateRequest,
    user: AuthenticatedUser = Depends(require_roles("ADMIN", "SECURITY_TESTER", "SECURITY_LEAD"))
):
    verify_user_project_access(user, project_id)
    return {
        "project_id": project_id,
        "finding_id": finding_id,
        "remediation_status": req.remediation_status,
        "resolution_notes": req.resolution_notes,
        "updated_by": user.user_id,
        "status": "UPDATED"
    }

@router.post("/{project_id}/evidence/{evidence_id}/verify")
async def verify_evidence_handler(
    project_id: str,
    evidence_id: str,
    req: EvidenceVerificationRequest,
    user: AuthenticatedUser = Depends(require_roles("ADMIN", "SECURITY_TESTER", "SECURITY_LEAD"))
):
    verify_user_project_access(user, project_id)
    return {
        "project_id": project_id,
        "evidence_id": evidence_id,
        "verification_status": req.status,
        "reviewer": user.name or req.reviewer,
        "status": "VERIFIED"
    }

@router.get("/{project_id}/next-actions")
async def get_next_actions_handler(
    project_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    verify_user_project_access(user, project_id)
    return [
        {
            "title": "Perform Authenticated Scans",
            "reason": "Initial scoping complete. Next step is active security assessment.",
            "urgency": "HIGH",
            "action_url": f"/workspace/{project_id}/assessment",
            "action_label": "Begin Assessment"
        }
    ]
