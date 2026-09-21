from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.core.security import get_current_user, AuthenticatedUser, verify_user_project_access, require_roles
from backend.risk.risk_service import RiskService
from backend.risk.risk_engine import RiskEngine

router = APIRouter(prefix="/api/risk", tags=["risk"])

class RiskFactorsRequest(BaseModel):
    project_id: Optional[str] = "PRJ-101"
    impact: int = Field(..., ge=1, le=5, description="Impact rating from 1 to 5")
    likelihood: int = Field(..., ge=1, le=5, description="Likelihood rating from 1 to 5")
    asset_criticality: int = Field(..., ge=1, le=5, description="Asset criticality from 1 to 5")
    exploitability: int = Field(..., ge=1, le=5, description="Exploitability from 1 to 5")
    final_priority: Optional[str] = Field(None, description="Tester override priority")
    reason: Optional[str] = Field(None, description="Reason for risk calibration")

class RiskAssessmentResponse(BaseModel):
    id: str
    finding_id: str
    impact: int
    likelihood: int
    asset_criticality: int
    exploitability: int
    risk_score: int
    risk_level: str
    recommended_priority: str
    final_priority: str
    assessed_by: str
    created_at: str

class ProjectRiskCalculationRequest(BaseModel):
    findings_scores: List[int] = Field(default_factory=list)

class ProjectRiskResponse(BaseModel):
    project_id: str
    overall_score: int
    risk_level: str
    highest_finding_score: int
    total_findings: int

@router.post("/assess/{finding_id}", response_model=RiskAssessmentResponse)
async def assess_finding_handler(
    finding_id: str,
    req: RiskFactorsRequest,
    user: AuthenticatedUser = Depends(require_roles("ADMIN", "SECURITY_TESTER", "SECURITY_LEAD"))
):
    if req.project_id:
        verify_user_project_access(user, req.project_id)
    assessment = RiskService.assess_finding(
        finding_id=finding_id,
        impact=req.impact,
        likelihood=req.likelihood,
        asset_criticality=req.asset_criticality,
        exploitability=req.exploitability,
        assessed_by=user.name or "Alex Vance",
        final_priority=req.final_priority
    )
    return RiskAssessmentResponse(**assessment)

@router.post("/project/{project_id}/calculate", response_model=ProjectRiskResponse)
async def calculate_project_risk_handler(
    project_id: str,
    req: ProjectRiskCalculationRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    verify_user_project_access(user, project_id)
    summary = RiskService.calculate_project_risk(req.findings_scores)
    return ProjectRiskResponse(
        project_id=project_id,
        overall_score=summary["overall_score"],
        risk_level=summary["risk_level"],
        highest_finding_score=summary["highest_finding_score"],
        total_findings=summary["total_findings"]
    )
