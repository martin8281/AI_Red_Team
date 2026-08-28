import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  FileCode, 
  Sparkles,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';
import { Finding, Evidence, FindingStatus, Priority } from '../types/finding.types';
import { RiskAssessment, RiskHistory, RiskFactors } from '../types/risk.types';
import { findingService } from '../services/findingService';
import { riskService } from '../services/riskService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { FindingHeader } from '../components/findings/FindingHeader';
import { FindingDetails } from '../components/findings/FindingDetails';
import { EvidenceList } from '../components/findings/EvidenceList';
import { EditFindingModal } from '../components/findings/EditFindingModal';
import { RiskBreakdownCard } from '../components/risk/RiskBreakdownCard';
import { AIRecommendationsCard } from '../components/risk/AIRecommendationsCard';
import { RiskHistoryTimeline } from '../components/risk/RiskHistoryTimeline';
import { EditRiskModal } from '../components/risk/EditRiskModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const FindingDetailsPage: React.FC = () => {
  const { findingId } = useParams<{ findingId: string }>();
  const navigate = useNavigate();

  const [finding, setFinding] = useState<Finding | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [history, setHistory] = useState<RiskHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRiskModalOpen, setEditRiskModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFindingData = async () => {
    if (!findingId) return;
    setIsLoading(true);
    try {
      const [fnd, evi, ass, hist] = await Promise.all([
        findingService.getFindingById(findingId),
        findingService.getFindingEvidence(findingId),
        riskService.getAssessmentByFindingId(findingId),
        riskService.getHistoryByFindingId(findingId),
      ]);

      if (fnd) setFinding(fnd);
      setEvidence(evi);
      setAssessment(ass);
      setHistory(hist);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFindingData();
  }, [findingId]);

  const handleStatusChange = async (newStatus: FindingStatus) => {
    if (!finding) return;
    const updated = await findingService.updateFinding(finding.id, { status: newStatus });
    if (updated) setFinding(updated);
  };

  const handleSaveEdit = async (updates: Partial<Finding>) => {
    if (!finding) return;
    const updated = await findingService.updateFinding(finding.id, updates);
    if (updated) {
      setFinding(updated);
      const ass = await riskService.getAssessmentByFindingId(finding.id);
      setAssessment(ass);
    }
  };

  const handleSaveRiskAssessment = async (
    factors: RiskFactors,
    finalPriority: Priority,
    reason: string
  ) => {
    if (!finding) return;
    const updated = await riskService.updateAssessment(
      finding.id,
      factors,
      finalPriority,
      reason,
      'Alex Vance'
    );
    setAssessment(updated);
    // Reload finding & history
    const [refreshedFinding, refreshedHist] = await Promise.all([
      findingService.getFindingById(finding.id),
      riskService.getHistoryByFindingId(finding.id),
    ]);
    if (refreshedFinding) setFinding(refreshedFinding);
    setHistory(refreshedHist);
  };

  const handleDeleteConfirm = async () => {
    if (!finding) return;
    setIsDeleting(true);
    try {
      await findingService.deleteFinding(finding.id);
      navigate('/findings', { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddEvidence = async (data: Omit<Evidence, 'id' | 'createdAt'>) => {
    await findingService.addEvidence(data);
    if (findingId) {
      const updatedEvi = await findingService.getFindingEvidence(findingId);
      setEvidence(updatedEvi);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    await findingService.deleteEvidence(evidenceId);
    if (findingId) {
      const updatedEvi = await findingService.getFindingEvidence(findingId);
      setEvidence(updatedEvi);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Finding..." subtitle="Retrieving vulnerability analysis">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-text-muted font-mono">Loading finding {findingId}...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!finding) {
    return (
      <DashboardLayout title="Finding Not Found" subtitle="Requested vulnerability does not exist">
        <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">Finding Not Found</h3>
            <p className="text-xs text-text-muted">
              The finding ID "{findingId}" was not found or has been deleted.
            </p>
          </div>
          <Button to="/findings" variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
            Return to Findings Catalog
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={finding.title}
      subtitle={`Vulnerability Analysis · ${finding.vulnerabilityType}`}
    >
      <div className="space-y-6">
        
        {/* Finding Header */}
        <FindingHeader
          finding={finding}
          onStatusChange={handleStatusChange}
          onEditClick={() => setEditModalOpen(true)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
        />

        {/* Deterministic Risk Breakdown Card */}
        {assessment && (
          <RiskBreakdownCard
            assessment={assessment}
            onEditClick={() => setEditRiskModalOpen(true)}
          />
        )}

        {/* Two-Column Grid: Finding Details & Risk Reasoning / Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Target Vector, Observations, Impact, Remediation */}
          <div className="lg:col-span-8 space-y-6">
            <FindingDetails finding={finding} />

            {/* AI Recommendations Card with Regenerate */}
            <AIRecommendationsCard findingId={finding.id} />
          </div>

          {/* Right Column: Evidence & Risk Calibration History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Evidence Section */}
            <EvidenceList
              findingId={finding.id}
              evidence={evidence}
              onAddEvidence={handleAddEvidence}
              onDeleteEvidence={handleDeleteEvidence}
            />

            {/* Risk History Timeline */}
            <RiskHistoryTimeline history={history} />
          </div>

        </div>

      </div>

      {/* Edit Finding Modal */}
      <EditFindingModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        finding={finding}
        onSave={handleSaveEdit}
      />

      {/* Edit Risk Assessment Modal */}
      {assessment && (
        <EditRiskModal
          isOpen={editRiskModalOpen}
          onClose={() => setEditRiskModalOpen(false)}
          assessment={assessment}
          onSave={handleSaveRiskAssessment}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-border-dark p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <div className="p-2 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                Delete Finding?
              </h3>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to delete finding <strong className="text-text-primary">{finding.id}: {finding.title}</strong>? All attached verification evidence and risk telemetry will be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-dark">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#EF4444]/90 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Finding'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
