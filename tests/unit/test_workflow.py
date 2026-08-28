"""
Unit Tests: Engagement Workflow State Machine Transitions.
"""
from backend.workspace.workflow_engine import WorkflowEngine

def test_valid_state_transitions():
    valid, msg = WorkflowEngine.validate_transition("PLANNING", "SCOPING")
    assert valid is True

    valid, msg = WorkflowEngine.validate_transition("SCOPING", "ASSESSMENT")
    assert valid is True

    valid, msg = WorkflowEngine.validate_transition("ASSESSMENT", "ANALYSIS")
    assert valid is True

    valid, msg = WorkflowEngine.validate_transition("ANALYSIS", "REMEDIATION")
    assert valid is True

    valid, msg = WorkflowEngine.validate_transition("REMEDIATION", "REPORTING")
    assert valid is True

    valid, msg = WorkflowEngine.validate_transition("REPORTING", "COMPLETED")
    assert valid is True

def test_invalid_skipping_transitions():
    valid, msg = WorkflowEngine.validate_transition("PLANNING", "COMPLETED")
    assert valid is False
    assert "Invalid transition" in msg

    valid, msg = WorkflowEngine.validate_transition("SCOPING", "REPORTING")
    assert valid is False
