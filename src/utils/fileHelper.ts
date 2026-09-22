import { ForensicAttachment } from '../types/ai.types';

export function bytesToReadableSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function detectFileCategory(extension: string, mimeType: string): ForensicAttachment['category'] {
  const ext = extension.toLowerCase();
  
  if (['log', 'pcap', 'pcapng', 'evtx', 'dump', 'raw', 'mem', 'trace', 'out'].includes(ext)) {
    return 'LOG';
  }
  if (['pdf', 'docx', 'doc', 'txt', 'md', 'rtf', 'odt'].includes(ext)) {
    return 'DOCUMENT';
  }
  if (['csv', 'json', 'xml', 'yaml', 'yml', 'sql', 'html', 'js', 'ts', 'py', 'sh', 'ps1', 'env'].includes(ext)) {
    return 'DATA';
  }
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2', 'xz'].includes(ext)) {
    return 'ARCHIVE';
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(ext) || mimeType.startsWith('image/')) {
    return 'IMAGE';
  }
  return 'BINARY';
}

export async function processForensicFile(file: File): Promise<ForensicAttachment> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'dat';
  const category = detectFileCategory(extension, file.type);
  const id = `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  let contentSnippet: string | undefined;
  let fullContent: string | undefined;
  let dataUrl: string | undefined;

  // 1. Textual extraction for readable plain text / code files
  const isDirectTextReadable = [
    'txt', 'log', 'csv', 'json', 'xml', 'yaml', 'yml', 'sql', 'html', 
    'js', 'ts', 'py', 'sh', 'ps1', 'md', 'env', 'config', 'trace', 'out', 'syslog'
  ].includes(extension) || file.type.startsWith('text/') || file.type === 'application/json';

  if (isDirectTextReadable) {
    try {
      const text = await file.text();
      fullContent = text;
      // Keep up to 35,000 chars for LLM context injection
      if (text.length > 35000) {
        contentSnippet = text.slice(0, 35000) + `\n\n... [TRUNCATED: ${bytesToReadableSize(file.size)} total file size]`;
      } else {
        contentSnippet = text;
      }
    } catch {
      contentSnippet = `[Forensic file: ${file.name}, size: ${bytesToReadableSize(file.size)}]`;
    }
  } else {
    // 2. For PDF, DOCX, Archives, and Binary files: extract full text via backend FileParserService
    try {
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/assistant/parse-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          content_base64: base64Data,
        }),
      });

      if (res.ok) {
        const parsedData = await res.json();
        if (parsedData.content && parsedData.content.trim()) {
          fullContent = parsedData.content;
          contentSnippet = parsedData.content;
        }
      }
    } catch {
      // Backend unavailable fallback
    }

    if (!contentSnippet) {
      contentSnippet = `[Attached Evidence Artifact: ${file.name} | Category: ${category} | Size: ${bytesToReadableSize(file.size)} | Format: .${extension.toUpperCase()}]`;
    }
  }

  // 3. Read as Data URL for preview/download (for images or small documents)
  if (file.size < 5 * 1024 * 1024) { // Under 5MB
    try {
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      });
    } catch {
      dataUrl = undefined;
    }
  }

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || `application/x-${extension}`,
    extension,
    category,
    contentSnippet,
    content: fullContent || contentSnippet,
    rawContent: fullContent || contentSnippet,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };
}
