"""
Engagement Workflow State Machine & Transition Validator.
"""
from typing import Dict, List, Tuple

VALID_TRANSITIONS: Dict[str, List[str]] = {
    "PLANNING": ["SCOPING", "ARCHIVED"],
    "SCOPING": ["ASSESSMENT", "PLANNING", "ARCHIVED"],
    "ASSESSMENT": ["ANALYSIS", "SCOPING", "ARCHIVED"],
    "ANALYSIS": ["REMEDIATION", "ASSESSMENT", "ARCHIVED"],
    "REMEDIATION": ["REPORTING", "ANALYSIS", "ARCHIVED"],
    "REPORTING": ["COMPLETED", "REMEDIATION", "ARCHIVED"],
    "COMPLETED": ["REPORTING", "ARCHIVED"],
    "ARCHIVED": ["PLANNING", "ASSESSMENT"],
}

class WorkflowEngine:
    @staticmethod
    def validate_transition(current_state: str, next_state: str) -> Tuple[bool, str]:
        allowed = VALID_TRANSITIONS.get(current_state, [])
        if next_state in allowed:
            return True, f"Valid transition from {current_state} to {next_state}."
        return False, f"Invalid transition: Cannot transition from {current_state} to {next_state}. Allowed: {allowed}."
