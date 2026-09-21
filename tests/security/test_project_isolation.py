"""
Security Tests: Multi-Tenant Project Isolation & IDOR Defense.
"""
from backend.core.scope_enforcer import ScopeEnforcer

def test_project_access_authorized():
    user_projects = ["PRJ-101", "PRJ-102"]
    valid, _ = ScopeEnforcer.verify_project_isolation(user_projects, "PRJ-101")
    assert valid is True

def test_idor_cross_project_access_denied():
    user_projects = ["PRJ-101"]
    valid, reason = ScopeEnforcer.verify_project_isolation(user_projects, "PRJ-999")
    assert valid is False
    assert "forbidden" in reason.lower()

def test_cross_project_evidence_linkage_blocked():
    valid, reason = ScopeEnforcer.validate_cross_project_linkage("PRJ-101", "PRJ-102", "Evidence")
    assert valid is False
    assert "Cross-project isolation violation" in reason
