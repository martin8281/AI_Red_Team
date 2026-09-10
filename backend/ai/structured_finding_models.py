from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class FindingOutputSchema(BaseModel):
    id: str = Field(..., description="Unique finding identifier, e.g. FND-101")
    category: str = Field(..., description="Security finding category (e.g. Authentication Bypass, Injection, Privilege Escalation)")
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] = Field(..., description="Risk severity level")
    severity_rationale: str = Field(..., description="Concise justification for the assigned severity")
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = Field(..., description="Confidence calibrated strictly on direct evidence proof")
    confidence_justification: str = Field(..., description="Why this confidence level was assigned based on direct vs indirect evidence")
    affected_asset: str = Field(..., description="Affected target endpoint, service, host, or component")
    evidence_refs: List[str] = Field(default_factory=list, description="List of immutable evidence IDs directly supporting this finding")
    description: str = Field(..., description="Concise 1-2 sentence description of the observed vulnerability or finding")
    impact: str = Field(..., description="Technical and business impact")
    recommendation: str = Field(..., description="Concrete remediation advice")
    mitre_technique: Optional[str] = Field(None, description="MITRE ATT&CK technique code (e.g., T1110.001)")
    detection_rule: Optional[str] = Field("DEFAULT", description="Detection rule identifier for false positive tracking")
    status: Literal["proposed", "accepted", "rejected"] = Field("proposed", description="Workflow state. Human-in-the-loop: starts as 'proposed'")


class CopilotInvestigationResponse(BaseModel):
    summary: str = Field(..., description="High-level investigation executive summary")
    findings: List[FindingOutputSchema] = Field(default_factory=list, description="Calibrated security findings in proposed state")
    correlated_events: List[Dict[str, Any]] = Field(default_factory=list, description="Pre-computed temporal correlation clusters")
    unverified_observations: List[str] = Field(default_factory=list, description="Observations with insufficient evidence to confirm as findings")
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = Field("HIGH", description="Overall investigation confidence")
