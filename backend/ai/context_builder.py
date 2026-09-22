from typing import Dict, Any, Optional
from .safety import SafetySanitizer

class ContextBuilder:
    @staticmethod
    def build_context(project_data: Dict[str, Any], context_type: str, finding_data: Optional[Dict[str, Any]] = None) -> str:
        if context_type == "general" or project_data.get("id") == "general":
            return "SCOPE: General Security Consultation & Open AI Assistant Mode."

        if context_type == "finding" and finding_data:
            payload = f"""
FINDING_ID: {finding_data.get('id')}
TITLE: {finding_data.get('title')}
VULNERABILITY_TYPE: {finding_data.get('vulnerabilityType')}
SEVERITY: {finding_data.get('severity')}
RISK_SCORE: {finding_data.get('riskScore')}/100
TARGET_ASSET: {finding_data.get('asset')}
HTTP_ENDPOINT: {finding_data.get('method')} {finding_data.get('endpoint')}
DESCRIPTION: {finding_data.get('description')}
IMPACT: {finding_data.get('impact')}
RECOMMENDATION: {finding_data.get('recommendation')}
"""
            return SafetySanitizer.wrap_untrusted_data("FINDING_CONTEXT", payload)
        
        in_scope = project_data.get("in_scope", ["api.apexfin.com", "auth.apexfin.com", "10.10.10.0/24"])
        out_of_scope = project_data.get("out_of_scope", ["prod-db.internal", "10.10.20.0/24", "admin.apexfin.com"])
        in_scope_str = "\n".join(f"- {t}" for t in in_scope)
        out_of_scope_str = "\n".join(f"- {t}" for t in out_of_scope)

        payload = f"""
PROJECT_NAME: {project_data.get('name')}
ORGANIZATION: {project_data.get('organization', 'Apex Financial Technologies')}
FRAMEWORK_TYPE: {project_data.get('projectType', 'Web Application Security Assessment')}
DESCRIPTION: {project_data.get('description', 'Authorized Red Team penetration test and vulnerability assessment.')}

AUTHORIZED_IN_SCOPE_TARGETS:
{in_scope_str}

EXCLUDED_OUT_OF_SCOPE_TARGETS:
{out_of_scope_str}
"""
        return SafetySanitizer.wrap_untrusted_data("PROJECT_CONTEXT", payload)
