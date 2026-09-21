import { ContextType } from '../types/ai.types';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { projectFileService } from '../services/projectFileService';
import { SafetySanitizer } from './safetySanitizer';

export interface ResolvedContext {
  projectId: string;
  projectName: string;
  contextType: ContextType;
  contextId?: string;
  contextSummary: string;
  structuredContext: string;
  attachedFilesCount: number;
}

export class ContextBuilder {
  /**
   * Resolves, verifies, and packages authorized context for the AI Co-Pilot,
   * including mandatory project-attached evidence files and datasets.
   */
  static async buildContext(
    projectId: string,
    contextType: ContextType,
    contextId?: string
  ): Promise<ResolvedContext> {
    // 0. Handle General Security Consultation (No specific project required)
    if (contextType === 'general' || projectId === 'general' || !projectId) {
      return {
        projectId: 'general',
        projectName: 'General Security Consultation',
        contextType: 'general',
        contextSummary: 'General Security Consultation & Advisory (Open scope)',
        structuredContext: `ENGAGEMENT_MODE: GENERAL_SECURITY_CONSULTATION
SCOPE: Open cybersecurity advisory, penetration testing methodologies, vulnerability mechanisms (OWASP Top 10, CWE, CVE), Active Directory/cloud attacks, threat intelligence, and digital forensics guidance.
No specific target boundary constraints apply. Provide direct, highly technical, and actionable security answers.`,
        attachedFilesCount: 0,
      };
    }

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found or access unauthorized.`);
    }

    const projectFiles = await projectFileService.getProjectFiles(projectId);

    let contextSummary = `Project: ${project.name}`;
    let contextPayload = '';

    switch (contextType) {
      case 'finding': {
        if (!contextId) {
          throw new Error('Finding ID is required when context type is "finding".');
        }
        const finding = await findingService.getFindingById(contextId);
        if (!finding) {
          throw new Error(`Finding ${contextId} not found.`);
        }
        // Strict boundary authorization check
        if (finding.projectId !== projectId) {
          throw new Error(`Finding ${contextId} does not belong to Project ${projectId}.`);
        }

        const evidenceList = await findingService.getFindingEvidence(finding.id);

        contextSummary = `Finding: [${finding.id}] ${finding.title}`;
        contextPayload = `
FINDING_ID: ${finding.id}
TITLE: ${finding.title}
VULNERABILITY_TYPE: ${finding.vulnerabilityType}
SEVERITY: ${finding.severity}
RISK_SCORE: ${finding.riskScore}/100
PRIORITY: ${finding.priority}
TARGET_ASSET: ${finding.asset}
HTTP_ENDPOINT: ${finding.method} ${finding.endpoint}
STATUS: ${finding.status}

DESCRIPTION_OBSERVATIONS:
${finding.description}

BUSINESS_TECHNICAL_IMPACT:
${finding.impact}

REMEDIATION_GUIDANCE:
${finding.recommendation}

ATTACHED_EVIDENCE_COUNT: ${evidenceList.length}
${evidenceList
  .map(
    (e, idx) => `EVIDENCE_${idx + 1}:
  Title: ${e.title}
  FileRef: ${e.fileReference || 'N/A'}
  Description: ${e.description}
  Sanitized Notes: ${e.notes || 'N/A'}`
  )
  .join('\n\n')}
`;
        break;
      }

      case 'scope': {
        const scopeAssets = await projectService.getScopeAssets(projectId);
        const inScope = scopeAssets.filter((a) => a.scopeStatus === 'IN_SCOPE');
        const outOfScope = scopeAssets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE');

        contextSummary = `Scope: ${inScope.length} In-Scope / ${outOfScope.length} Out-of-Scope Targets`;
        contextPayload = `
PROJECT_NAME: ${project.name}
ORGANIZATION: ${project.organization}
ENGAGEMENT_TYPE: ${project.projectType}

AUTHORIZED_IN_SCOPE_TARGETS:
${inScope.map((a) => `- [${a.assetType}] ${a.value} (${a.description || 'Authorized Target'})`).join('\n') || 'None'}

EXCLUDED_OUT_OF_SCOPE_TARGETS:
${outOfScope.map((a) => `- [${a.assetType}] ${a.value} (${a.description || 'Explicitly Excluded'})`).join('\n') || 'None'}
`;
        break;
      }

      case 'risk': {
        const findings = await findingService.getFindingsByProjectId(projectId);
        contextSummary = `Risk Profile: Score ${project.riskScore}/100 (${findings.length} findings)`;
        contextPayload = `
PROJECT: ${project.name}
AGGREGATE_RISK_SCORE: ${project.riskScore}/100
CRITICAL_FINDINGS_COUNT: ${project.criticalFindingCount}
HIGH_FINDINGS_COUNT: ${project.highFindingCount || 0}
MEDIUM_FINDINGS_COUNT: ${project.mediumFindingCount || 0}
LOW_FINDINGS_COUNT: ${project.lowFindingCount || 0}

HIGH_IMPACT_FINDINGS_LIST:
${findings
  .filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
  .map((f) => `- [${f.severity} - ${f.riskScore}/100] ${f.title} (${f.vulnerabilityType}) on ${f.asset}`)
  .join('\n') || 'No critical or high severity vulnerabilities logged.'}
`;
        break;
      }

      case 'evidence': {
        const findings = await findingService.getFindingsByProjectId(projectId);
        const allEvidences = await Promise.all(
          findings.map((f) => findingService.getFindingEvidence(f.id))
        );
        const flattened = allEvidences.flat();

        contextSummary = `Evidence Repository (${flattened.length} artifacts)`;
        contextPayload = `
PROJECT: ${project.name}
TOTAL_ATTACHED_EVIDENCES: ${flattened.length}

EVIDENCE_ARTIFACTS:
${flattened
  .map(
    (e) => `- [Finding: ${e.findingId}] ${e.title} (${e.fileReference || 'Log trace'}): ${e.description}`
  )
  .join('\n') || 'No evidence artifacts logged for this engagement.'}
`;
        break;
      }

      case 'project':
      default: {
        const findings = await findingService.getFindingsByProjectId(projectId);
        const scopeAssets = await projectService.getScopeAssets(projectId);
        const inScope = scopeAssets.filter((a) => a.scopeStatus === 'IN_SCOPE');
        const outOfScope = scopeAssets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE');

        contextSummary = `Entire Project: ${project.name}`;
        contextPayload = `
PROJECT_NAME: ${project.name}
ORGANIZATION: ${project.organization}
FRAMEWORK_TYPE: ${project.projectType}
TIMELINE: ${project.startDate} to ${project.endDate}
LEAD_TESTER: ${project.leadTester || 'Alex Vance'}
ENGAGEMENT_OBJECTIVES:
${project.description}

AUTHORIZED_IN_SCOPE_TARGETS:
${inScope.map((a) => `- [${a.assetType}] ${a.value} (${a.description || 'Authorized Target'})`).join('\n') || 'None'}

EXCLUDED_OUT_OF_SCOPE_TARGETS:
${outOfScope.map((a) => `- [${a.assetType}] ${a.value} (${a.description || 'Explicitly Excluded Target'})`).join('\n') || 'None'}

TOTAL_LOGGED_FINDINGS: ${findings.length}
AGGREGATE_RISK_SCORE: ${project.riskScore}/100
`;
        break;
      }
    }

    // MANDATORY PROJECT ATTACHED EVIDENCE FILES INJECTION
    if (projectFiles.length > 0) {
      const filesBlock = projectFiles
        .map(
          (pf, idx) => `[ATTACHED PROJECT FILE ${idx + 1}: ${pf.name}] (Category: ${pf.category} | Size: ${pf.size} bytes)
${pf.description ? `Objective / Description: ${pf.description}\n` : ''}Snippet / Extracted Content:
${pf.contentSnippet ? pf.contentSnippet.slice(0, 1500) : 'File indexed in project store.'}`
        )
        .join('\n\n');

      contextPayload += `\n\n==================================================
MANDATORY ATTACHED PROJECT EVIDENCE FILES (${projectFiles.length} files attached):
==================================================
INSTRUCTION: Before answering any query about this project, you MUST refer to, inspect, and cite these project-attached evidence files (e.g., [File: ${projectFiles[0].name}]). Ground your response in the actual content of these files.

${filesBlock}
==================================================`;
    }

    return {
      projectId,
      projectName: project.name,
      contextType,
      contextId,
      contextSummary,
      structuredContext: SafetySanitizer.wrapUntrustedData(
        `${project.name} - ${contextType.toUpperCase()}`,
        contextPayload
      ),
      attachedFilesCount: projectFiles.length,
    };
  }
}
