import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean raw json tags or extra quotes if present
  let cleanText = content.trim();

  // If text is wrapped in JSON quotes or escapes
  if ((cleanText.startsWith('"') && cleanText.endsWith('"')) || (cleanText.startsWith("'") && cleanText.endsWith("'"))) {
    try {
      cleanText = JSON.parse(cleanText);
    } catch {
      cleanText = cleanText.slice(1, -1);
    }
  }

  // Parse lines into blocks
  const lines = cleanText.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  const renderInline = (text: string): React.ReactNode[] => {
    // Helper to format inline markdown: **bold**, `code`, *italic*
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // 1. Inline Code: `code`
      const codeMatch = /`([^`]+)`/.exec(remaining);
      // 2. Bold: **text**
      const boldMatch = /\*\*([^*]+)\*\*/.exec(remaining);

      let earliestType: 'code' | 'bold' | null = null;
      let earliestIdx = remaining.length;

      if (codeMatch && codeMatch.index < earliestIdx) {
        earliestIdx = codeMatch.index;
        earliestType = 'code';
      }
      if (boldMatch && boldMatch.index < earliestIdx) {
        earliestIdx = boldMatch.index;
        earliestType = 'bold';
      }

      if (!earliestType) {
        parts.push(remaining);
        break;
      }

      if (earliestIdx > 0) {
        parts.push(remaining.slice(0, earliestIdx));
      }

      if (earliestType === 'code' && codeMatch) {
        parts.push(
          <code
            key={`code-${keyIdx++}`}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#050A14] border border-[#1E293B] text-[#A78BFA] font-mono text-[11px] font-semibold"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(earliestIdx + codeMatch[0].length);
      } else if (earliestType === 'bold' && boldMatch) {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-bold text-[#F8FAFC]">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(earliestIdx + boldMatch[0].length);
      }
    }

    return parts;
  };

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
    const listClass = currentList.type === 'ul' ? 'list-disc pl-5 space-y-1 my-2' : 'list-decimal pl-5 space-y-1 my-2';
    
    blocks.push(
      <ListTag key={`list-${blocks.length}`} className={listClass}>
        {currentList.items.map((item, i) => (
          <li key={i} className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code Block Toggle (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push(
          <div key={`codeblock-${blocks.length}`} className="my-3 rounded-xl bg-[#050A14] border border-[#1E293B] p-3 font-mono text-xs text-[#38BDF8] overflow-x-auto">
            {codeBlockLang && <div className="text-[10px] text-[#94A3B8] uppercase font-bold border-b border-[#1E293B] pb-1 mb-2">{codeBlockLang}</div>}
            <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="text-lg sm:text-xl font-extrabold text-[#F8FAFC] tracking-tight mt-4 mb-2 pb-1 border-b border-[#1E293B]">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="text-sm sm:text-base font-bold text-[#F8FAFC] tracking-tight mt-3 mb-1.5 flex items-center gap-1.5 border-b border-[#1E293B]/40 pb-1">
          <span className="text-[#8B5CF6]">#</span>
          <span>{renderInline(trimmed.slice(3))}</span>
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="text-xs sm:text-sm font-bold text-[#A78BFA] mt-2 mb-1">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Unordered List (- item or * item)
    const ulMatch = /^[-*]\s+(.+)/.exec(trimmed);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered List (1. item)
    const olMatch = /^\d+\.\s+(.+)/.exec(trimmed);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Paragraph Line
    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 font-sans ${className}`}>{blocks}</div>;
};
