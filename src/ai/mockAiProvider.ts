import { 
  StructuredAIResponse, 
  QuickActionType, 
  ContextType 
} from '../types/ai.types';
import { Severity } from '../types/finding.types';

export class MockAiProvider {
  /**
   * Generates a context-aware security testing response.
   */
  static async generate(params: {
    projectName: string;
    contextType: ContextType;
    contextId?: string;
    contextText: string;
    userMessage: string;
    quickAction?: QuickActionType;
  }): Promise<StructuredAIResponse> {
    // Artificial latency for professional feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { contextType, contextText, userMessage, quickAction, projectName } = params;
    const lowerMsg = userMessage.toLowerCase();

    // 1. Finding Context
    if (contextType === 'finding') {
      if (quickAction === 'suggest_remediation' || lowerMsg.includes('remediat') || lowerMsg.includes('fix') || lowerMsg.includes('patch')) {
        return {
          summary: 'Defensive Remediation Strategy & Hardening Guidelines',
          risk: {
            level: 'HIGH',
            score: 82,
            text: 'Remediating this finding mitigates high-impact data exposure on target boundary.',
          },
          reasoning:
            'The vulnerability arises from unvalidated parameter propagation directly into backend query or authorization evaluations. Standard architectural mitigation requires input boundary sanitation and strict server-side policy enforcement.',
          impact:
            'Eliminates potential horizontal privilege escalation and unauthorized database read/write access by malicious actors.',
          recommendation: `1. Enforce strict parameterization (Prepared Statements / ORM queries).\n2. Implement context-aware output encoding.\n3. Verify session token ownership in middleware before retrieving resource IDs.\n4. Deploy rate limiting and structured security header controls.`,
          suggestedValidation:
            'Re-execute the verified benign test payload to ensure the server responds with an appropriate 400/403 status without altering data state.',
          confidence: 'HIGH',
        };
      }

      if (quickAction === 'analyze_risk' || lowerMsg.includes('risk') || lowerMsg.includes('score') || lowerMsg.includes('cvss')) {
        return {
          summary: 'CVSS v3.1 & Threat Vector Risk Assessment',
          risk: {
            level: 'CRITICAL',
            score: 92,
            text: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N (Base Score: 9.1)',
          },
          reasoning:
            'Network-accessible vector with low attack complexity requiring zero specialized privileges. The vulnerability directly targets core asset boundaries.',
          impact:
            'High Confidentiality and High Integrity breach potential. An adversary could extract sensitive tenant data and bypass multi-factor security controls.',
          recommendation:
            'Prioritize for immediate P1 remediation cycle with hotfix deployment within 24–48 hours.',
          suggestedValidation:
            'Audit adjacent API endpoints sharing the same controller base class for identical parameter handling patterns.',
          confidence: 'HIGH',
        };
      }

      if (quickAction === 'generate_description' || lowerMsg.includes('description') || lowerMsg.includes('report')) {
        return {
          summary: 'Audit-Compliant Vulnerability Finding Deliverable',
          risk: {
            level: 'HIGH',
            score: 78,
            text: 'Standardized documentation formatted for executive security assessment reports.',
          },
          reasoning:
            'Structured observation detailing target host, reproduction parameters, and verified HTTP response differentials without disclosing sensitive credentials.',
          impact:
            'Comprehensive technical narrative prepared for engineering teams and client executive stakeholders.',
          recommendation:
            'Include the sanitized PoC evidence snippet and verified HTTP headers in the final assessment deliverable appendix.',
          suggestedValidation:
            'Ensure peer review sign-off by Lead Security Tester prior to client dispatch.',
          confidence: 'HIGH',
        };
      }

      // Default Finding Explanation
      return {
        summary: `Technical Vulnerability Analysis for ${params.contextId || 'Active Finding'}`,
        risk: {
          level: 'HIGH',
          score: 84,
          text: 'Verified vulnerability on target host.',
        },
        reasoning:
          'Based on the provided finding context, user-controlled input appears to influence backend logic without adequate schema validation or authorization checks. The issue can be reliably observed during standard engagement testing.',
        impact:
          'Unauthorized data access, privilege escalation, or unexpected service disruption depending on backend tenancy design.',
        recommendation:
          '1. Implement server-side input filtering and strict whitelist schema enforcement.\n2. Adopt centralized access control middleware to validate actor permissions.\n3. Suppress verbose debug exception traces in production responses.',
        suggestedValidation:
          'Verify that edge reverse proxy / WAF rules do not solely act as the primary defense; backend code patches must be verified.',
        confidence: 'HIGH',
      };
    }

    // 2. Scope Context
    if (contextType === 'scope') {
      return {
        summary: `Scope Analysis & Attack Surface Exposure for ${projectName}`,
        risk: {
          level: 'MEDIUM',
          score: 55,
          text: 'Attack surface consists of registered domains, IP subnets, and API endpoints.',
        },
        reasoning:
          'The authorized target boundary comprises verified in-scope assets. Testing should remain strictly constrained within these specified hosts to respect the rules of engagement.',
        impact:
          'Ensures authorized coverage while avoiding non-authorized third-party cloud infrastructure.',
        recommendation:
          'Correlate discovered findings strictly against the in-scope asset whitelist. Verify that external webhook dispatches do not target excluded out-of-scope ranges.',
        suggestedValidation:
          'Cross-reference DNS resolving records against defined in-scope assets before launching verification scripts.',
        confidence: 'HIGH',
      };
    }

    // 3. Risk Context
    if (contextType === 'risk') {
      return {
        summary: `Engagement Risk Posture Evaluation for ${projectName}`,
        risk: {
          level: 'HIGH',
          score: 76,
          text: 'Cumulative threat exposure driven by high-severity findings in critical workflows.',
        },
        reasoning:
          'Multiple findings share overlapping attack vectors on core web and API endpoints, compounding overall threat surface.',
        impact:
          'High aggregate enterprise exposure if left unaddressed. Chaining vulnerabilities could allow an adversary to traverse from low-privileged endpoints to administrative export controllers.',
        recommendation:
          'Focus remediation triage on P1 Immediate items before addressing hardening headers or informational items.',
        suggestedValidation:
          'Track remediation verification using the Finding Lifecycle (transition from OPEN to REMEDIATION to RESOLVED).',
        confidence: 'HIGH',
      };
    }

    // 4. Project Context (Default)
    return {
      summary: `Engagement Executive Summary for ${projectName}`,
      risk: {
        level: 'HIGH',
        score: 72,
        text: 'Comprehensive assessment co-pilot evaluation.',
      },
      reasoning: `Analysis of ${projectName} indicates active security testing across defined scope assets. Vulnerability findings have been cataloged with verified evidence and CVSS metrics.`,
      impact:
        'Engagement provides actionable visibility into system vulnerabilities prior to production adversary exploitation.',
      recommendation:
        '1. Remediate Critical and High severity findings immediately.\n2. Re-test verified findings upon patch deployment.\n3. Generate audit-ready assessment report upon completion of testing.',
      suggestedValidation:
        'Maintain human-in-the-loop validation of all remediation checklists.',
      confidence: 'HIGH',
    };
  }
}
