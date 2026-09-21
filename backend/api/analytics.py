from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.core.security import get_current_user, AuthenticatedUser, verify_user_project_access

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class AnalyticsFilterPayload(BaseModel):
    project_id: Optional[str] = "ALL"
    date_range: Optional[str] = "30d"
    severity: Optional[str] = "ALL"
    status: Optional[str] = "ALL"
    priority: Optional[str] = "ALL"

class AnalyticsOverviewResponse(BaseModel):
    overall_risk_score: int
    average_risk_score: int
    max_risk_score: int
    total_findings: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    open_count: int
    in_progress_count: int
    resolved_count: int
    remediation_rate: int
    average_remediation_days: float

class AIInsightsResponse(BaseModel):
    posture_summary: str
    biggest_concern: str
    priority_remediation: str
    trend_explanation: str
    remediation_rate_insight: str

@router.post("/overview", response_model=AnalyticsOverviewResponse)
async def analytics_overview_handler(
    payload: AnalyticsFilterPayload,
    user: AuthenticatedUser = Depends(get_current_user)
):
    if payload.project_id and payload.project_id != "ALL":
        verify_user_project_access(user, payload.project_id)
    return AnalyticsOverviewResponse(
        overall_risk_score=75,
        average_risk_score=68,
        max_risk_score=92,
        total_findings=4,
        critical_count=1,
        high_count=1,
        medium_count=1,
        low_count=1,
        open_count=1,
        in_progress_count=1,
        resolved_count=2,
        remediation_rate=50,
        average_remediation_days=3.5
    )

@router.post("/insights", response_model=AIInsightsResponse)
async def analytics_insights_handler(
    payload: AnalyticsFilterPayload,
    user: AuthenticatedUser = Depends(get_current_user)
):
    if payload.project_id and payload.project_id != "ALL":
        verify_user_project_access(user, payload.project_id)
    return AIInsightsResponse(
        posture_summary="The organization posture is currently elevated due to 1 critical SQL injection finding.",
        biggest_concern="Unauthenticated SQL injection on authentication endpoint.",
        priority_remediation="Refactor authentication queries to use parameterized prepared statements.",
        trend_explanation="Remediation pace increased 24% over the last 30 days.",
        remediation_rate_insight="50% of identified findings have been verified as remediated."
    )
