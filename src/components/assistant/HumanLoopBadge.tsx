import React, { useState } from 'react';
import { ShieldCheck, Info, X, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export const HumanLoopBadge: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101827] border border-[#1E293B] hover:border-[#8B5CF6]/50 text-xs text-[#22C55E] transition-all cursor-pointer shadow-sm group"
        title="Human-in-the-loop governance active"
      >
        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
        <span className="font-medium text-[#F8FAFC]">Human-in-the-loop</span>
        <span className="p-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] group-hover:text-[#A78BFA]">
          <Info className="w-3 h-3" />
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B1220] border border-[#1E293B] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Human-in-the-Loop Governance
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Mandatory security protocols & analyst oversight
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#101827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#101827] border border-[#1E293B]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F8FAFC] block">AI provides analysis & recommendations</strong>
                  <span>The AI acts as an advisory copilot, correlating evidence, calculating risk factors, and suggesting test cases.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#101827] border border-[#1E293B]">
                <Lock className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F8FAFC] block">Human controls all final decisions</strong>
                  <span>No findings are automatically written to final reports without explicit analyst review and confirmation.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#101827] border border-[#1E293B]">
                <AlertTriangle className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F8FAFC] block">Findings are in proposed state</strong>
                  <span>Findings remain in a proposed review queue until an analyst accepts or rejects them with rationale.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
