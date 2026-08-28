from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class RiskFactorsRequest(BaseModel):
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

class ProjectRiskResponse(BaseModel):
    project_id: str
    overall_score: int
    risk_level: str
    highest_finding_score: int
    total_findings: int
