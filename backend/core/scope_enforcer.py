"""
Scope Enforcement & Project Isolation Subsystem.
Enforces engagement authorization boundaries, target validation, and cross-project multi-tenant isolation.
"""
import ipaddress
from urllib.parse import urlparse
from typing import List, Dict, Any, Tuple, Optional

class ScopeEnforcer:
    @staticmethod
    def normalize_target(target: str) -> str:
        """Strips protocol schemes, trailing slashes, and ports for boundary comparison."""
        if not target:
            return ""
        t = target.strip().lower()
        if "://" in t:
            try:
                parsed = urlparse(t)
                t = parsed.hostname or t
            except Exception:
                pass
        if ":" in t and not t.endswith("]"):  # Not IPv6
            t = t.split(":")[0]
        return t.rstrip("/")

    @classmethod
    def is_target_in_scope(
        cls,
        target: str,
        in_scope_list: List[str],
        out_of_scope_list: List[str]
    ) -> Tuple[bool, str]:
        """
        Validates whether a target asset, URL, hostname, or IP address is strictly within
        the authorized engagement scope and not explicitly excluded.
        """
        if not target:
            return False, "Target asset cannot be empty."

        clean_target = cls.normalize_target(target)
        if not clean_target:
            return False, "Invalid target format."

        # 1. Check explicit Out-of-Scope Exclusions FIRST
        for excluded in out_of_scope_list:
            clean_ex = cls.normalize_target(excluded)
            if clean_target == clean_ex:
                return False, f"Target '{target}' is explicitly OUT-OF-SCOPE (Engagement exclusion rule)."
            if clean_ex.startswith("*.") and clean_target.endswith(clean_ex[1:]):
                return False, f"Target '{target}' matches excluded wildcard domain '{excluded}'."
            # Check CIDR exclusion
            if "/" in excluded:
                try:
                    net = ipaddress.ip_network(excluded, strict=False)
                    ip = ipaddress.ip_address(clean_target)
                    if ip in net:
                        return False, f"Target IP '{target}' falls within excluded CIDR subnet '{excluded}'."
                except ValueError:
                    pass

        # 2. Check In-Scope Inclusions
        matched_in_scope = False
        for allowed in in_scope_list:
            clean_in = cls.normalize_target(allowed)
            if clean_target == clean_in:
                matched_in_scope = True
                break
            if clean_in.startswith("*.") and clean_target.endswith(clean_in[1:]):
                matched_in_scope = True
                break
            # Check CIDR inclusion
            if "/" in allowed:
                try:
                    net = ipaddress.ip_network(allowed, strict=False)
                    ip = ipaddress.ip_address(clean_target)
                    if ip in net:
                        matched_in_scope = True
                        break
                except ValueError:
                    pass

        if not matched_in_scope:
            return False, f"Target '{target}' is not listed in authorized engagement scope."

        return True, f"Target '{target}' is authorized and within scope boundaries."

    @staticmethod
    def verify_project_isolation(
        user_accessible_projects: List[str],
        requested_project_id: str
    ) -> Tuple[bool, str]:
        """
        Prevents IDOR / BOLA attacks by ensuring users can only access their authorized projects.
        """
        if not requested_project_id:
            return False, "Project ID cannot be empty."
        if "*" in user_accessible_projects or requested_project_id in user_accessible_projects:
            return True, "Authorized access to project."
        return False, f"Unauthorized: Access to project '{requested_project_id}' is forbidden."

    @staticmethod
    def validate_cross_project_linkage(
        parent_project_id: str,
        child_project_id: str,
        resource_type: str = "Evidence"
    ) -> Tuple[bool, str]:
        """
        Ensures foreign evidence, files, or findings cannot be linked to a different project.
        """
        if parent_project_id != child_project_id:
            return False, f"Cross-project isolation violation: {resource_type} belonging to '{child_project_id}' cannot be linked to '{parent_project_id}'."
        return True, "Valid resource ownership."
