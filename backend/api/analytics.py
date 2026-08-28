from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

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
