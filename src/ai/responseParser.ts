import { StructuredAIResponse } from '../types/ai.types';
import { Severity } from '../types/finding.types';

export class ResponseParser {
  /**
   * Parses LLM output into a typed StructuredAIResponse object.
   */
  static parse(raw: string | object): StructuredAIResponse {
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Partial<StructuredAIResponse>;
      return {
        summary: obj.summary || 'Vulnerability Analysis Complete',
        risk: obj.risk,
        reasoning: obj.reasoning || '',
        impact: obj.impact || '',
        recommendation: obj.recommendation || '',
        suggestedValidation: obj.suggestedValidation,
        confidence: obj.confidence || 'HIGH',
        rawText: typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2),
      };
    }

    const text = String(raw);

    // Try parsing JSON block if present
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary || parsed.reasoning || parsed.recommendation) {
          return {
            summary: parsed.summary || 'Vulnerability Analysis',
            risk: parsed.risk,
            reasoning: parsed.reasoning || '',
            impact: parsed.impact || '',
            recommendation: parsed.recommendation || '',
            suggestedValidation: parsed.suggestedValidation,
            confidence: parsed.confidence || 'HIGH',
            rawText: text,
          };
        }
      }
    } catch {
      // Fallback to text parsing
    }

    // Fallback: extract sections via regex headers if available
    const summaryMatch = text.match(/(?:###\s*Summary|Summary:?)\s*([\s\S]*?)(?=(?:###|Risk:|Reasoning:|$))/i);
    const reasoningMatch = text.match(/(?:###\s*Reasoning|Reasoning:?)\s*([\s\S]*?)(?=(?:###|Impact:|Recommendation:|$))/i);
    const impactMatch = text.match(/(?:###\s*Impact|Impact:?)\s*([\s\S]*?)(?=(?:###|Recommendation:|Validation:|$))/i);
    const recMatch = text.match(/(?:###\s*Recommendation|Recommendation:?)\s*([\s\S]*?)(?=(?:###|Validation:|Confidence:|$))/i);
    const valMatch = text.match(/(?:###\s*Suggested Validation|Validation:?)\s*([\s\S]*?)(?=(?:###|Confidence:|$))/i);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : text.slice(0, 160) + '...',
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : text,
      impact: impactMatch ? impactMatch[1].trim() : 'Impact under evaluation based on active engagement context.',
      recommendation: recMatch ? recMatch[1].trim() : 'Implement defense-in-depth controls aligned with OWASP guidelines.',
      suggestedValidation: valMatch ? valMatch[1].trim() : undefined,
      confidence: 'HIGH',
      rawText: text,
    };
  }
}
