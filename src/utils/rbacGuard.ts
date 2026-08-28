/**
 * Role-Based Access Control (RBAC) & Object-Level Permission Guards.
 */

export type UserRole = 'ADMIN' | 'SECURITY_TESTER' | 'REVIEWER' | 'VIEWER';

export interface RolePermissions {
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canCreateFinding: boolean;
  canEditFinding: boolean;
  canVerifyEvidence: boolean;
  canGenerateReport: boolean;
  canIngestKnowledge: boolean;
  canUpdateRemediation: boolean;
  canModifyRiskScores: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canCreateProject: true,
    canDeleteProject: true,
    canCreateFinding: true,
    canEditFinding: true,
    canVerifyEvidence: true,
    canGenerateReport: true,
    canIngestKnowledge: true,
    canUpdateRemediation: true,
    canModifyRiskScores: true,
  },
  SECURITY_TESTER: {
    canCreateProject: true,
    canDeleteProject: false,
    canCreateFinding: true,
    canEditFinding: true,
    canVerifyEvidence: true,
    canGenerateReport: true,
    canIngestKnowledge: true,
    canUpdateRemediation: true,
    canModifyRiskScores: true,
  },
  REVIEWER: {
    canCreateProject: false,
    canDeleteProject: false,
    canCreateFinding: false,
    canEditFinding: false,
    canVerifyEvidence: true,
    canGenerateReport: true,
    canIngestKnowledge: false,
    canUpdateRemediation: true,
    canModifyRiskScores: false,
  },
  VIEWER: {
    canCreateProject: false,
    canDeleteProject: false,
    canCreateFinding: false,
    canEditFinding: false,
    canVerifyEvidence: false,
    canGenerateReport: false,
    canIngestKnowledge: false,
    canUpdateRemediation: false,
    canModifyRiskScores: false,
  },
};

export function hasPermission(
  role: UserRole | string,
  permission: keyof RolePermissions
): boolean {
  const normalizedRole = (role?.toUpperCase() as UserRole) || 'VIEWER';
  const roleRules = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.VIEWER;
  return !!roleRules[permission];
}

/**
 * Object-Level Ownership & Project Authorization Check.
 * Prevents IDOR access to findings, evidence, and deliverables.
 */
export function verifyObjectOwnership(
  userAccessibleProjectIds: string[],
  targetProjectId: string
): boolean {
  if (!targetProjectId) return false;
  if (userAccessibleProjectIds.includes('*')) return true; // Super Admin
  return userAccessibleProjectIds.includes(targetProjectId);
}
