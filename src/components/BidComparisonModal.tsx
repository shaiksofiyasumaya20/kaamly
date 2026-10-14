import React from 'react';
import { Job, Bid } from '../types';
import { getCategoryMeta } from '../utils/categories';
import {
  X,
  Star,
  CheckCircle2,
  DollarSign,
  Clock,
  ShieldCheck,
  Award,
  Phone,
  Check,
  User,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Wrench,
  Loader2,
} from 'lucide-react';

interface BidComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSelectWorker: (jobId: string, bidId: string) => Promise<void>;
  onOpenCompleteModal: (job: Job) => void;
  isSelectingBidId: string | null;
}

export const BidComparisonModal: React.FC<BidComparisonModalProps> = ({
  isOpen,
  onClose,
  job,
  onSelectWorker,
  onOpenCompleteModal,
  isSelectingBidId,
}) => {
  if (!isOpen || !job) return null;

  const categoryMeta = getCategoryMeta(job.category);
  const CategoryIcon = categoryMeta.icon;

  // Find lowest bid
  const lowestBidAmount =
    job.bids.length > 0 ? Math.min(...job.bids.map((b) => b.proposedPrice)) : 0;

  // Sort bids: accepted first, then by lowest price
  const sortedBids = [...job.bids].sort((a, b) => {
    if (a.status === 'accepted') return -1;
    if (b.status === 'accepted') return 1;
    return a.proposedPrice - b.proposedPrice;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <span>{job.category} Job</span>
                <span>·</span>
                <span>Status: {job.status}</span>
              </div>
              <h2 className="text-lg font-bold text-white font-heading truncate max-w-lg">
                {job.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Job Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Your Budget
              </span>
              <span className="text-lg font-extrabold font-mono text-slate-900">
                ${job.budget}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Bids Received
              </span>
              <span className="text-lg font-extrabold font-mono text-amber-600">
                {job.bids.length} Pro Quote{job.bids.length === 1 ? '' : 's'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Lowest Quote
              </span>
              <span className="text-lg font-extrabold font-mono text-emerald-600">
                {lowestBidAmount > 0 ? `$${lowestBidAmount}` : 'None yet'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Timing
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-1">{job.urgency}</span>
            </div>
          </div>

          {/* If Status is Worker Selected */}
          {job.status === 'Worker Selected' && job.selectedWorker && (
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold uppercase tracking-wider text-emerald-950 font-heading">
                    Worker Selected & Job In Progress
                  </span>
                </div>
                <button
                  onClick={() => onOpenCompleteModal(job)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider font-heading flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Mark Work Completed & Rate
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-emerald-200/60 text-xs">
                <div>
                  <span className="text-emerald-800 font-medium">Assigned Pro:</span>{' '}
                  <strong className="text-slate-900 text-sm">{job.selectedWorker.workerName}</strong>{' '}
                  <span className="text-slate-500">({job.selectedWorker.tradeTitle})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-slate-900 font-bold text-sm">
                    Agreed Price: ${job.selectedWorker.agreedPrice}
                  </span>
                  <span className="text-emerald-700 font-medium">
                    Awarded: {new Date(job.selectedWorker.selectedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* If Status is Completed */}
          {job.status === 'Completed' && (
            <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sky-950">
                <CheckCircle2 className="w-5 h-5 text-sky-600" />
                <span className="text-sm font-bold uppercase tracking-wider font-heading">
                  Job Completed & Verified
                </span>
                {job.completedAt && (
                  <span className="text-xs text-sky-700 font-mono">
                    · Finished {new Date(job.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {job.review && (
                <div className="p-3 bg-white rounded-lg border border-sky-100 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < job.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-slate-700 font-bold ml-1 font-mono">
                      {job.review.rating}/5 Rating
                    </span>
                  </div>
                  <p className="text-slate-700 italic">"{job.review.comment}"</p>
                </div>
              )}
            </div>
          )}

          {/* Bids List Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 font-heading">
                Compare Worker Proposals ({job.bids.length})
              </h3>
              <p className="text-xs text-slate-500">
                Review verified profiles, timelines, and prices before awarding the contract.
              </p>
            </div>
            {job.status === 'Open' && job.bids.length > 0 && (
              <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Lowest Quote: ${lowestBidAmount}
              </span>
            )}
          </div>

          {/* Empty State */}
          {job.bids.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-slate-800 font-heading uppercase">
                Awaiting First Pro Proposal
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your job was posted recently. Local tradespeople in {job.neighborhood} are reviewing
                the scope and preparing their bids.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBids.map((bid) => {
                const isLowest = bid.proposedPrice === lowestBidAmount && job.bids.length > 1;
                const isSelected = bid.status === 'accepted';
                const isRejected = bid.status === 'rejected';
                const savings = job.budget - bid.proposedPrice;

                return (
                  <div
                    key={bid.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                        : isRejected
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Worker Info */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={
                            bid.workerAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={bid.workerName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 font-heading">
                              {bid.workerName}
                            </h4>
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {bid.workerRating.toFixed(1)}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              ({bid.completedJobsCount} jobs completed · {bid.yearsExperience} yrs exp)
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            {bid.tradeTitle}
                          </div>

                          {/* Highlights */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {bid.estimatedTime}
                            </span>
                            {bid.includesMaterials && (
                              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Parts & Materials Included
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Selection Action */}
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                        <div>
                          <div className="text-2xl font-extrabold font-mono text-slate-900">
                            ${bid.proposedPrice}
                          </div>
                          {savings > 0 ? (
                            <span className="text-[11px] text-emerald-700 font-semibold font-mono flex items-center gap-0.5 justify-end">
                              <TrendingDown className="w-3 h-3" />
                              Save ${savings} vs budget
                            </span>
                          ) : savings === 0 ? (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Exact budget match
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-mono">
                              +${Math.abs(savings)} above budget
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {job.status === 'Open' ? (
                          <button
                            type="button"
                            onClick={() => onSelectWorker(job.id, bid.id)}
                            disabled={Boolean(isSelectingBidId)}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-all uppercase tracking-wider font-heading disabled:opacity-60"
                          >
                            {isSelectingBidId === bid.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Selecting...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Select & Hire Pro</span>
                              </>
                            )}
                          </button>
                        ) : isSelected ? (
                          <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md uppercase tracking-wide">
                            <Check className="w-3 h-3" /> Selected Pro
                          </span>
                        ) : (
                          <span className="mt-2 text-xs text-slate-400 font-medium">
                            Not Selected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Proposal Pitch Message */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Proposal Note:
                      </span>
                      <p className="leading-relaxed">"{bid.message}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Close button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
