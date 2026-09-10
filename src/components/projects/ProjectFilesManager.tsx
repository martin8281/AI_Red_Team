import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Terminal, 
  FileCode, 
  Archive, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Sparkles, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HardDrive,
  FolderOpen
} from 'lucide-react';
import { ProjectFile, ProjectFileCategory } from '../../types/projectFile.types';
import { projectFileService } from '../../services/projectFileService';
import { bytesToReadableSize } from '../../utils/fileHelper';
import { ProjectFilePreviewModal } from './ProjectFilePreviewModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';

interface ProjectFilesManagerProps {
  projectId: string;
  projectName: string;
  onFilesUpdated?: (files: ProjectFile[]) => void;
}

export const ProjectFilesManager: React.FC<ProjectFilesManagerProps> = ({
  projectId,
  projectName,
  onFilesUpdated,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ProjectFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const data = await projectFileService.getProjectFiles(projectId);
      setFiles(data);
      if (onFilesUpdated) onFilesUpdated(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const handleFileUpload = async (uploadedFileList: FileList | null) => {
    if (!uploadedFileList || uploadedFileList.length === 0) return;
    setIsUploading(true);
    setUploadSuccessMsg(null);

    try {
      for (let i = 0; i < uploadedFileList.length; i++) {
        await projectFileService.addProjectFile(
          projectId, 
          uploadedFileList[i],
          `Evidence artifact attached to ${projectName}`
        );
      }
      setUploadSuccessMsg(`Successfully attached ${uploadedFileList.length} file(s) to project.`);
      setTimeout(() => setUploadSuccessMsg(null), 3500);
      await loadFiles();
    } catch (err) {
      // handle error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to remove "${fileName}" from this project?`)) {
      await projectFileService.deleteProjectFile(projectId, fileId);
      await loadFiles();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.tags && f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (category: ProjectFileCategory) => {
    switch (category) {
      case 'LOG':
        return <Terminal className="w-4 h-4 text-[#3B82F6]" />;
      case 'DATA':
        return <FileCode className="w-4 h-4 text-[#8B5CF6]" />;
      case 'ARCHIVE':
        return <Archive className="w-4 h-4 text-[#EAB308]" />;
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4 text-[#22C55E]" />;
      default:
        return <FileText className="w-4 h-4 text-[#CBD5E1]" />;
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 bg-[#0B1220] border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Total Attached Files</span>
            <HardDrive className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <p className="text-2xl font-black text-[#F8FAFC] mt-1">{files.length}</p>
          <span className="text-[10px] font-mono text-[#94A3B8]">
            {bytesToReadableSize(totalSize)} cumulative storage
          </span>
        </Card>

        <Card variant="default" className="p-4 bg-[#0B1220] border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Forensic Logs</span>
            <Terminal className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <p className="text-2xl font-black text-[#3B82F6] mt-1">
            {files.filter(f => f.category === 'LOG').length}
          </p>
          <span className="text-[10px] font-mono text-[#94A3B8]">Auth, Firewall, WAF traces</span>
        </Card>

        <Card variant="default" className="p-4 bg-[#0B1220] border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Scans & Data Dumps</span>
            <FileCode className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <p className="text-2xl font-black text-[#A78BFA] mt-1">
            {files.filter(f => f.category === 'DATA').length}
          </p>
          <span className="text-[10px] font-mono text-[#94A3B8]">XML, CSV, JSON, PCAP</span>
        </Card>

        <Card variant="default" className="p-4 bg-[#0B1220] border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">RoE & Pentest Docs</span>
            <FileText className="w-4 h-4 text-[#22C55E]" />
          </div>
          <p className="text-2xl font-black text-[#22C55E] mt-1">
            {files.filter(f => f.category === 'DOCUMENT').length}
          </p>
          <span className="text-[10px] font-mono text-[#94A3B8]">PDF, Scope rules, Specs</span>
        </Card>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-3 ${
          isDragOver
            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[1.01]'
            : 'border-[#1E293B] hover:border-[#8B5CF6]/60 bg-[#0B1220]/60 hover:bg-[#101827]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1 max-w-lg">
          <h4 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
            {isUploading ? 'Extracting & Indexing Files...' : 'Attach Evidence Files & Datasets to Engagement'}
          </h4>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Drag and drop any files from device storage or <span className="text-[#A78BFA] underline">browse local drive</span>.
            Supports <strong>PDF, LOG, TXT, CSV, JSON, XML, PCAP, DOCX, ZIP</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#94A3B8]">
          <span className="px-2 py-0.5 rounded bg-[#101827] border border-[#1E293B]">Auto Content Extraction</span>
          <span className="px-2 py-0.5 rounded bg-[#101827] border border-[#1E293B]">Referenced in AI Assistant</span>
        </div>
      </div>

      {/* Success alert message */}
      {uploadSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0B1220] border border-[#1E293B]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attached files by name, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'LOG', 'DATA', 'DOCUMENT', 'ARCHIVE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-[#101827] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              {cat === 'ALL' ? 'All Files' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid / List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6] mx-auto" />
          <p className="text-xs font-mono text-[#94A3B8]">Loading project files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-[#0B1220] border border-[#1E293B] p-8">
          <FolderOpen className="w-10 h-10 text-[#94A3B8] mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-[#F8FAFC]">No files attached matching filters</h4>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Upload logs, pentest reports, PCAP traces, or configs to attach them to this engagement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/40 transition-all flex flex-col justify-between space-y-3 group shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-[#101827] border border-[#1E293B] shrink-0 mt-0.5">
                      {getFileIcon(file.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#F8FAFC] truncate group-hover:text-[#A78BFA] transition-colors">
                        {file.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#94A3B8]">
                        {bytesToReadableSize(file.size)} · .{file.extension.toUpperCase()} · {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Badge variant="brand" size="sm">{file.category}</Badge>
                </div>

                {file.description && (
                  <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    {file.description}
                  </p>
                )}

                {file.contentSnippet && (
                  <div className="p-2 rounded-lg bg-[#050A14] border border-[#1E293B]/60 font-mono text-[10px] text-[#94A3B8] truncate">
                    {file.contentSnippet.split('\n')[0] || file.contentSnippet.slice(0, 80)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPreviewFile(file)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Preview
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigate(`/assistant?projectId=${file.projectId}&contextType=project&file=${encodeURIComponent(file.name)}`);
                    }}
                    icon={<Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                  >
                    Analyze
                  </Button>
                </div>

                <button
                  onClick={() => handleDelete(file.id, file.name)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreviewFile && (
        <ProjectFilePreviewModal
          file={selectedPreviewFile}
          onClose={() => setSelectedPreviewFile(null)}
        />
      )}

    </div>
  );
};
