import { ProjectFile, ProjectFileCategory } from '../types/projectFile.types';
import { detectFileCategory, bytesToReadableSize } from '../utils/fileHelper';

const STORAGE_KEY_PROJECT_FILES = 'art_project_files_data';

const initialMockProjectFiles: ProjectFile[] = [
  {
    id: 'pfile-101-1',
    projectId: 'PRJ-101',
    name: 'auth_audit.log',
    size: 45200,
    extension: 'log',
    category: 'LOG',
    uploadedAt: '2026-08-27T08:15:00.000Z',
    uploadedBy: 'Alex Vance',
    description: 'Authentication controller audit logs capturing perimeter login attempts.',
    tags: ['auth', 'brute-force', 'perimeter', 'audit'],
    lineCount: 342,
    contentSnippet: `2026-08-27T08:00:12Z AUTH_FAIL src_ip=198.51.100.44 user=admin endpoint=/api/v1/auth status=401 reason=INVALID_CREDENTIALS
2026-08-27T08:00:14Z AUTH_FAIL src_ip=198.51.100.44 user=admin endpoint=/api/v1/auth status=401 reason=INVALID_CREDENTIALS
2026-08-27T08:00:18Z AUTH_FAIL src_ip=198.51.100.44 user=root endpoint=/api/v1/auth status=401 reason=INVALID_CREDENTIALS
2026-08-27T08:01:05Z SQL_INJECT_PAYLOAD_DETECTED src_ip=198.51.100.44 param=username val="admin' OR '1'='1" endpoint=/api/v1/auth
2026-08-27T08:01:06Z AUTH_SUCCESS src_ip=198.51.100.44 user=admin token_issued=eyJhbGciOiJIUzI1Ni... endpoint=/api/v1/auth status=200
2026-08-27T08:01:22Z DB_QUERY_EXEC duration_ms=450 query="SELECT * FROM accounts WHERE username = 'admin' OR '1'='1' LIMIT 1" rows=1`,
    fullContent: `2026-08-27T08:00:12Z AUTH_FAIL src_ip=198.51.100.44 user=admin endpoint=/api/v1/auth status=401 reason=INVALID_CREDENTIALS
2026-08-27T08:00:14Z AUTH_FAIL src_ip=198.51.100.44 user=admin endpoint=/api/v1/auth status=401 reason=INVALID_CREDENTIALS
2026-08-27T08:00:18Z AUTH_FAIL src_ip=198.51.100.44 user=root endpoint=/api/v1/auth status=401 reason=INVALID_CREDENTIALS
2026-08-27T08:01:05Z SQL_INJECT_PAYLOAD_DETECTED src_ip=198.51.100.44 param=username val="admin' OR '1'='1" endpoint=/api/v1/auth
2026-08-27T08:01:06Z AUTH_SUCCESS src_ip=198.51.100.44 user=admin token_issued=eyJhbGciOiJIUzI1Ni... endpoint=/api/v1/auth status=200
2026-08-27T08:01:22Z DB_QUERY_EXEC duration_ms=450 query="SELECT * FROM accounts WHERE username = 'admin' OR '1'='1' LIMIT 1" rows=1
2026-08-27T08:02:10Z SENSITIVE_EXPORT src_ip=198.51.100.44 endpoint=/api/v1/customers/dump bytes=142000 status=200`,
  },
  {
    id: 'pfile-101-2',
    projectId: 'PRJ-101',
    name: 'nmap_perimeter_scan.xml',
    size: 28400,
    extension: 'xml',
    category: 'DATA',
    uploadedAt: '2026-08-27T08:20:00.000Z',
    uploadedBy: 'Alex Vance',
    description: 'Nmap TCP port scan and service banner enumeration on perimeter targets.',
    tags: ['nmap', 'ports', 'perimeter', 'recon'],
    lineCount: 180,
    contentSnippet: `<?xml version="1.0" encoding="UTF-8"?>
<nmaprun scanner="nmap" args="nmap -sV -sC -p 80,443,8080,8443 api.apexfin.com" start="1724746800">
  <host>
    <status state="up"/>
    <address addr="203.0.113.15" addrtype="ipv4"/>
    <hostnames><hostname name="api.apexfin.com" type="user"/></hostnames>
    <ports>
      <port protocol="tcp" portid="80"><state state="open"/><service name="http" product="nginx" version="1.24.0"/></port>
      <port protocol="tcp" portid="443"><state state="open"/><service name="https" product="nginx" version="1.24.0" tunnel="ssl"/></port>
      <port protocol="tcp" portid="8080"><state state="open"/><service name="http-proxy" product="Node.js Express framework"/></port>
    </ports>
  </host>
</nmaprun>`,
  },
  {
    id: 'pfile-101-3',
    projectId: 'PRJ-101',
    name: 'pentest_methodology_scope.pdf',
    size: 512000,
    extension: 'pdf',
    category: 'DOCUMENT',
    uploadedAt: '2026-08-27T08:10:00.000Z',
    uploadedBy: 'Alex Vance',
    description: 'Authorized Rules of Engagement (RoE) and test protocol documentation.',
    tags: ['rules-of-engagement', 'scope', 'compliance'],
    lineCount: 1,
    contentSnippet: `[Authorized Penetration Testing Deliverable - Apex Financial Core Banking System]
Assessment Scope: api.apexfin.com, auth.apexfin.com
Excluded Targets: staging-internal.apexfin.com, payment-switch.apexfin.com
Testing Window: 2026-08-25 to 2026-09-05
Rules of Engagement: Non-destructive testing only. Do not perform Denial of Service attacks.`,
  },
  {
    id: 'pfile-102-1',
    projectId: 'PRJ-102',
    name: 'payment_gateway_api.json',
    size: 18900,
    extension: 'json',
    category: 'DATA',
    uploadedAt: '2026-08-27T08:45:00.000Z',
    uploadedBy: 'Elena Rostova',
    description: 'Postman collection & OpenAPI schema for payment settlement endpoints.',
    tags: ['api', 'postman', 'openapi', 'transfers'],
    lineCount: 95,
    contentSnippet: `{
  "openapi": "3.0.1",
  "info": { "title": "NexBank Transfer Gateway API", "version": "v2.1" },
  "paths": {
    "/v2/transfers/execute": {
      "post": {
        "summary": "Execute Interbank Fund Settlement",
        "parameters": [
          { "name": "source_account", "in": "query", "required": true },
          { "name": "destination_account", "in": "query", "required": true },
          { "name": "amount", "in": "query", "required": true }
        ],
        "responses": { "200": { "description": "Transfer initiated" } }
      }
    }
  }
}`,
  },
];

class ProjectFileService {
  private delay(ms = 150): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadFiles(): ProjectFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROJECT_FILES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockProjectFiles;
  }

  private saveFiles(files: ProjectFile[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECT_FILES, JSON.stringify(files));
    } catch {
      // ignore
    }
  }

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    await this.delay(100);
    const all = this.loadFiles();
    if (!projectId || projectId === 'ALL') {
      return all;
    }
    return all.filter((f) => f.projectId === projectId);
  }

  async getProjectFileById(projectId: string, fileId: string): Promise<ProjectFile | null> {
    await this.delay(80);
    const files = await this.getProjectFiles(projectId);
    return files.find((f) => f.id === fileId) || null;
  }

  async addProjectFile(
    projectId: string,
    file: File,
    description?: string,
    tags?: string[]
  ): Promise<ProjectFile> {
    await this.delay(250);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'dat';
    const category = detectFileCategory(extension, file.type) as ProjectFileCategory;
    const id = `pfile-${Date.now().toString().slice(-6)}`;

    let contentSnippet = '';
    let fullContent = '';
    let lineCount = 1;

    // Extract text for text-readable formats
    const isTextReadable = [
      'txt', 'log', 'csv', 'json', 'xml', 'yaml', 'yml', 'sql', 'html', 
      'js', 'ts', 'py', 'sh', 'ps1', 'md', 'env', 'config', 'trace', 'out'
    ].includes(extension) || file.type.startsWith('text/') || file.type === 'application/json';

    if (isTextReadable) {
      try {
        const text = await file.text();
        fullContent = text;
        lineCount = text.split('\n').length;
        contentSnippet = text.slice(0, 25000);
        if (text.length > 25000) {
          contentSnippet += `\n\n... [TRUNCATED: ${bytesToReadableSize(file.size)} total file size]`;
        }
      } catch {
        contentSnippet = `[Project Evidence File: ${file.name} | Size: ${bytesToReadableSize(file.size)}]`;
      }
    } else {
      contentSnippet = `[Project Attached File: ${file.name} | Category: ${category} | Format: .${extension.toUpperCase()} | Size: ${bytesToReadableSize(file.size)}]`;
    }

    const newFile: ProjectFile = {
      id,
      projectId,
      name: file.name,
      size: file.size,
      extension,
      category,
      contentSnippet,
      fullContent: fullContent || contentSnippet,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current Analyst',
      description: description || `Attached ${category.toLowerCase()} artifact: ${file.name}`,
      tags: tags || [category.toLowerCase(), extension],
      lineCount,
    };

    const all = this.loadFiles();
    all.unshift(newFile);
    this.saveFiles(all);

    // Dispatch event for live dashboard and listener updates
    try {
      window.dispatchEvent(new CustomEvent('project-file-added', { detail: { projectId, file: newFile } }));
    } catch {
      // ignore
    }

    return newFile;
  }

  async deleteProjectFile(projectId: string, fileId: string): Promise<boolean> {
    await this.delay(150);
    let all = this.loadFiles();
    const initialLen = all.length;
    all = all.filter((f) => !(f.projectId === projectId && f.id === fileId));
    this.saveFiles(all);

    try {
      window.dispatchEvent(new CustomEvent('project-file-deleted', { detail: { projectId, fileId } }));
    } catch {
      // ignore
    }

    return all.length < initialLen;
  }
}

export const projectFileService = new ProjectFileService();
