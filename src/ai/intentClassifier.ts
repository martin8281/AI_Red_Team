import { QuickActionType, ResponseIntentType } from '../types/ai.types';

export class IntentClassifier {
  private static CASUAL_PATTERNS = [
    /^(h+i+|h+e+y+|h+e+l+l+o+|h+o+l+a+|howdy|sup|yo|what'?s\s*up|greetings|good\s*(morning|afternoon|evening)|hlo|hii+|heyy+|namaste|welcome)(\s+there)?[\s!.,?]*$/i,
    /^(thanks|thank\s*you|thx|cheers|great|ok|okay|cool|got\s*it|nice|understood|awesome|sounds\s*good|perfect)(\s+very\s+much|\s+a\s+lot|\s+so\s+much)?[\s!.,?]*$/i,
    /^(who\s*are\s*you|what\s*can\s*you\s*do|what\s*is\s*your\s*role|help\s*me|introduce\s*yourself)[\s!.,?]*$/i,
    /^(how\s*are\s*you(\s*doing)?|how's\s*it\s*going|what's\s*up)[\s!.,?]*$/i,
    /^(bye|goodbye|see\s*you|later)[\s!.,?]*$/i,
  ];

  private static CLARIFYING_PATTERNS = [
    /which\s+log\s+(should\s+i|to)\s+(look\s+at|check|upload|analyze|examine)\s+(first|next)?/i,
    /how\s+(do|should|can)\s+i\s+(start|begin|proceed|triage|test|investigate|setup)/i,
    /where\s+(do|can|should)\s+i\s+(start|begin|upload|attach|find|see|look)/i,
    /what\s+(do\s+you\s+mean|does\s+this\s+mean|is\s+the\s+next\s+step|should\s+i\s+do\s+next)/i,
    /(guide|walk)\s+me\s+through/i,
    /what\s+(information|data|evidence|logs)\s+do\s+you\s+need/i,
    /how\s+to\s+(configure|setup|use\s+this|begin\s+testing)/i,
    /can\s+you\s+explain\s+what\s+you\s+need/i,
  ];

  private static FULL_ASSESSMENT_PATTERNS = [
    /(analyze|assess)\s+(this|the)\s+(entire\s+)?(project|engagement)/i,
    /(give|provide|show)\s+me\s+(the\s+)?full\s+(risk\s+)?assessment/i,
    /comprehensive\s+(analysis|assessment|audit|review)/i,
    /generate\s+(an?\s+)?(engagement\s+)?(report|deliverable)/i,
    /threat\s+model(ing)?\s+(review|assessment|analysis)/i,
    /(overall|full|complete)\s+(risk\s+)?(posture|evaluation|summary)/i,
    /executive\s+summary\s+of\s+(the\s+)?(project|engagement)/i,
    /full\s+security\s+audit/i,
    /audit\s+(this|the)\s+(project|engagement)/i,
    /(main|all)\s+security\s+findings/i,
    /prepare\s+(the\s+)?(main\s+)?findings/i,
  ];

  private static SPECIFIC_QUERY_PATTERNS = [
    /(list|show|display|get)\s+(the\s+)?(all\s+|open\s+|verified\s+)?findings/i,
    /what('s|\s+is)\s+the\s+severity\s+of\s+(finding|fnd)/i,
    /(explain|describe)\s+(finding|vulnerability|fnd|vuln)/i,
    /(show|give)\s+me\s+(just\s+|only\s+)?(the\s+)?(remediation|recommendation|fix|patch)/i,
    /what\s+(are\s+the\s+)?recommendations?\s+for/i,
    /is\s+([a-zA-Z0-9.-]+)\s+in\s+scope/i,
    /(show|view|get)\s+(the\s+)?evidence\s+(for|of)/i,
    /what\s+is\s+(cve|cwe|cvss|mitre)/i,
    /show\s+(me\s+)?(the\s+)?(cvss|risk\s+score)\s+(for|of)?/i,
    /how\s+many\s+findings/i,
  ];

  /**
   * Classifies incoming chat message into one of 4 intent categories.
   */
  static classify(
    message: string,
    quickAction?: QuickActionType,
    hasAttachments: boolean = false
  ): ResponseIntentType {
    const cleanMsg = message.trim();
    const lowerMsg = cleanMsg.toLowerCase();

    // 1. Quick actions
    if (quickAction) {
      if (quickAction === 'summarize_project') return 'full_assessment';
      if (quickAction === 'analyze_forensics') return hasAttachments ? 'full_assessment' : 'specific_query';
      return 'specific_query';
    }

    // 2. Attachments without text default to assessment
    if (hasAttachments && !cleanMsg) {
      return 'full_assessment';
    }

    // 3. Casual
    for (const pattern of this.CASUAL_PATTERNS) {
      if (pattern.test(lowerMsg)) return 'casual';
    }

    // 4. Clarifying
    for (const pattern of this.CLARIFYING_PATTERNS) {
      if (pattern.test(lowerMsg)) return 'clarifying';
    }

    // 5. Full Assessment
    for (const pattern of this.FULL_ASSESSMENT_PATTERNS) {
      if (pattern.test(lowerMsg)) return 'full_assessment';
    }

    // 6. Specific Query
    for (const pattern of this.SPECIFIC_QUERY_PATTERNS) {
      if (pattern.test(lowerMsg)) return 'specific_query';
    }

    // 7. Very short input without security keywords
    if (lowerMsg.length < 12 && !/(vuln|log|risk|find|port|ip|cve|cwe|scan|auth)/i.test(lowerMsg)) {
      return 'casual';
    }

    // 8. Default for security inquiries
    return 'specific_query';
  }
}
