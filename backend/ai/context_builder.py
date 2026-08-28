from typing import Dict, Any, Optional
from .safety import SafetySanitizer

class ContextBuilder:
    @staticmethod
    def build_context(project_data: Dict[str, Any], context_type: str, finding_data: Optional[Dict[str, Any]] = None) -> str:
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
        
        payload = f"""
PROJECT_NAME: {project_data.get('name')}
ORGANIZATION: {project_data.get('organization')}
FRAMEWORK_TYPE: {project_data.get('projectType')}
DESCRIPTION: {project_data.get('description')}
"""
        return SafetySanitizer.wrap_untrusted_data("PROJECT_CONTEXT", payload)
