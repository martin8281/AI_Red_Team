import { RiskFactors, RiskLevel } from '../types/risk.types';
import { Priority } from '../types/finding.types';

export interface RiskWeights {
  impact: number;
  likelihood: number;
  assetCriticality: number;
  exploitability: number;
}

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  impact: 0.35,
  likelihood: 0.30,
  assetCriticality: 0.20,
  exploitability: 0.15,
};

export class RiskEngine {
  private static weights: RiskWeights = DEFAULT_RISK_WEIGHTS;

  /**
   * Validates that risk factor inputs are strictly between 1 and 5.
   */
  static validateFactors(factors: RiskFactors): void {
    const keys: (keyof RiskFactors)[] = [
      'impact',
      'likelihood',
      'assetCriticality',
      'exploitability',
    ];
    for (const key of keys) {
      const val = factors[key];
      if (typeof val !== 'number' || isNaN(val) || val < 1 || val > 5) {
        throw new Error(
          `Invalid risk factor '${key}': ${val}. Factors must be between 1 and 5.`
        );
      }
    }
  }

  /**
   * Deterministically calculates normalized risk score from 0 to 100.
   */
  static calculateScore(factors: RiskFactors): number {
    this.validateFactors(factors);

    const raw =
      factors.impact * this.weights.impact +
      factors.likelihood * this.weights.likelihood +
      factors.assetCriticality * this.weights.assetCriticality +
      factors.exploitability * this.weights.exploitability;

    // Linear normalization from scale [1.0, 5.0] to [0, 100]
    const normalized = ((raw - 1.0) / 4.0) * 100;
    const rounded = Math.round(normalized);

    return Math.max(0, Math.min(100, rounded));
  }

  /**
   * Maps a numerical score (0-100) to its corresponding Risk Level.
   * 0 - 29   -> LOW
   * 30 - 49  -> MODERATE
   * 50 - 74  -> HIGH
   * 75 - 100 -> CRITICAL
   */
  static getRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Recommends a remediation priority based on risk score.
   * 75 - 100 -> P1 — Immediate
   * 60 - 74  -> P2 — High
   * 40 - 59  -> P3 — Normal
   * 0 - 39   -> P4 — Low
   */
  static getRecommendedPriority(score: number): Priority {
    if (score >= 75) return 'P1 — Immediate';
    if (score >= 60) return 'P2 — High';
    if (score >= 40) return 'P3 — Normal';
    return 'P4 — Low';
  }

  /**
   * Convenience full assessment computation.
   */
  static evaluate(factors: RiskFactors): {
    score: number;
    level: RiskLevel;
    recommendedPriority: Priority;
  } {
    const score = this.calculateScore(factors);
    const level = this.getRiskLevel(score);
    const recommendedPriority = this.getRecommendedPriority(score);
    return { score, level, recommendedPriority };
  }
}
