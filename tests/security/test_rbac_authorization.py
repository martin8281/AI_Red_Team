"""
Security Tests: Role-Based Access Control (RBAC) & Privilege Escalation Defense.
"""
from backend.core.rbac import RBACManager

def test_admin_has_full_permissions():
    assert RBACManager.check_permission("ADMIN", "create_project") is True
    assert RBACManager.check_permission("ADMIN", "verify_evidence") is True
    assert RBACManager.check_permission("ADMIN", "delete_project") is True

def test_security_tester_cannot_delete_project():
    assert RBACManager.check_permission("SECURITY_TESTER", "create_finding") is True
    assert RBACManager.check_permission("SECURITY_TESTER", "delete_project") is False

def test_viewer_role_has_no_write_permissions():
    assert RBACManager.check_permission("VIEWER", "create_finding") is False
    assert RBACManager.check_permission("VIEWER", "verify_evidence") is False
    assert RBACManager.check_permission("VIEWER", "generate_report") is False
