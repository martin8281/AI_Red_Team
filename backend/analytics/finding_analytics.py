from typing import List, Dict, Any

class FindingAnalytics:
    @staticmethod
    def aggregate_findings(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(findings)
        critical = sum(1 for f in findings if f.get("severity") == "CRITICAL")
        high = sum(1 for f in findings if f.get("severity") == "HIGH")
        medium = sum(1 for f in findings if f.get("severity") == "MEDIUM")
        low = sum(1 for f in findings if f.get("severity") in ["LOW", "INFORMATIONAL"])

        open_count = sum(1 for f in findings if f.get("status") == "OPEN" and not f.get("remediation_status"))
        in_progress = sum(1 for f in findings if f.get("status") == "REMEDIATION" or f.get("remediation_status") in ["IN_PROGRESS", "FIXED"])
        resolved = sum(1 for f in findings if f.get("status") == "RESOLVED" or f.get("remediation_status") == "VERIFIED")

        return {
            "total": total,
            "by_severity": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low,
            },
            "by_status": {
                "open": open_count,
                "in_progress": in_progress,
                "resolved": resolved,
            },
        }
