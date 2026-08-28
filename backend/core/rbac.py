"""
RBAC and Object-Level Authorization Validator.
"""
from typing import List, Optional

ROLE_PERMISSIONS = {
    "ADMIN": {"create_project", "delete_project", "create_finding", "verify_evidence", "generate_report", "ingest_knowledge", "update_remediation"},
    "SECURITY_TESTER": {"create_project", "create_finding", "verify_evidence", "generate_report", "ingest_knowledge", "update_remediation"},
    "REVIEWER": {"verify_evidence", "generate_report", "update_remediation"},
    "VIEWER": set(),
}

class RBACManager:
    @staticmethod
    def check_permission(user_role: str, permission: str) -> bool:
        role = user_role.upper()
        allowed = ROLE_PERMISSIONS.get(role, set())
        return permission in allowed

    @staticmethod
    def check_object_access(user_accessible_projects: List[str], target_project_id: str) -> bool:
        if not target_project_id:
            return False
        if "*" in user_accessible_projects:
            return True
        return target_project_id in user_accessible_projects
