"""
Security Tests: Scope Boundary Enforcement & Out-of-Scope Refusal.
"""
from backend.core.scope_enforcer import ScopeEnforcer

def test_in_scope_target_allowed():
    in_scope = ["api.apexfin.com", "auth.apexfin.com", "192.168.1.0/24", "*.apexfin.corp"]
    out_of_scope = ["prod-db.internal", "192.168.1.254"]

    valid, reason = ScopeEnforcer.is_target_in_scope("https://api.apexfin.com/v1/login", in_scope, out_of_scope)
    assert valid is True
    assert "authorized" in reason

    valid, reason = ScopeEnforcer.is_target_in_scope("192.168.1.50", in_scope, out_of_scope)
    assert valid is True

    valid, reason = ScopeEnforcer.is_target_in_scope("portal.apexfin.corp", in_scope, out_of_scope)
    assert valid is True

def test_out_of_scope_target_blocked():
    in_scope = ["api.apexfin.com", "auth.apexfin.com", "192.168.1.0/24"]
    out_of_scope = ["prod-db.internal", "192.168.1.254", "admin.apexfin.com"]

    # Explicit exclusion rule
    valid, reason = ScopeEnforcer.is_target_in_scope("prod-db.internal", in_scope, out_of_scope)
    assert valid is False
    assert "OUT-OF-SCOPE" in reason

    # Explicit IP exclusion inside subnet
    valid, reason = ScopeEnforcer.is_target_in_scope("192.168.1.254", in_scope, out_of_scope)
    assert valid is False

    # Unlisted target
    valid, reason = ScopeEnforcer.is_target_in_scope("evil-thirdparty.com", in_scope, out_of_scope)
    assert valid is False
    assert "not listed" in reason
