export type ProjectFileCategory = 
  | 'LOG' 
  | 'DOCUMENT' 
  | 'DATA' 
  | 'ARCHIVE' 
  | 'IMAGE' 
  | 'BINARY'
  | 'CONFIG'
  | 'NETWORK';

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  extension: string;
  category: ProjectFileCategory;
  contentSnippet?: string;
  fullContent?: string;
  dataUrl?: string;
  uploadedAt: string;
  uploadedBy?: string;
  description?: string;
  tags?: string[];
  lineCount?: number;
  sha256?: string;
}
