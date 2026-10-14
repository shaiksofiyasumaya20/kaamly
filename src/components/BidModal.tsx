import React, { useState } from 'react';
import { Job, WorkerProfile } from '../types';
import { getCategoryMeta } from '../utils/categories';
import {
  X,
  Gavel,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Star,
  Check,
  Loader2,
} from 'lucide-react';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  activeWorker: WorkerProfile;
  workers: WorkerProfile[];
  onSelectWorker: (worker: WorkerProfile) => void;
  onSubmitBid: (
    jobId: string,
    bidData: {
      workerId: string;
      workerName: string;
      workerAvatar?: string;
      tradeTitle: string;
      workerRating: number;
      completedJobsCount: number;
      yearsExperience: number;
      proposedPrice: number;
      estimatedTime: string;
      message: string;
      includesMaterials: boolean;
    }
  ) => Promise<void>;
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  job,
  activeWorker,
  workers,
  onSelectWorker,
  onSubmitBid,
}) => {
  if (!isOpen || !job) return null;

  const [proposedPrice, setProposedPrice] = useState<string>(
    job.budget ? Math.round(job.budget * 0.95).toString() : '150'
  );
  const [estimatedTime, setEstimatedTime] = useState('Tomorrow by 2:00 PM');
  const [message, setMessage] = useState(
    `Hello ${job.customerName.split(' ')[0]}, I would be glad to handle this ${job.category.toLowerCase()} job. I have all professional equipment ready and offer complete warranty.`
  );
  const [includesMaterials, setIncludesMaterials] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const numPrice = Number(proposedPrice);
  const budgetDiff = job.budget - (isNaN(numPrice) ? 0 : numPrice);
  const categoryMeta = getCategoryMeta(job.category);
  const CategoryIcon = categoryMeta.icon;

  const templateMessages = [
    'Can arrive within 60 minutes with full truck inventory and replacement parts.',
    'Includes premium grade materials, clean drop-cloth protection, and 90-day warranty.',
    'Licensed and bonded specialist with 10+ years experience in this neighborhood.',
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!proposedPrice || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'Please enter a valid bid amount';
    } else if (numPrice > job.budget * 2) {
      errs.price = `Your quote ($${numPrice}) is more than 2x the customer's budget ($${job.budget}). Please adjust or provide reasoning.`;
    }

    if (!estimatedTime.trim()) {
      errs.time = 'Estimated completion or start timeline is required';
    }

    if (!message.trim()) {
      errs.message = 'Please include a brief message or proposal explanation';
    } else if (message.trim().length < 15) {
      errs.message = 'Message must be at least 15 characters to explain your service to the customer';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmitBid(job.id, {
        workerId: activeWorker.id,
        workerName: activeWorker.name,
        workerAvatar: activeWorker.avatar,
        tradeTitle: activeWorker.tradeTitle,
        workerRating: activeWorker.rating,
        completedJobsCount: activeWorker.completedJobsCount,
        yearsExperience: activeWorker.yearsExperience,
        proposedPrice: numPrice,
        estimatedTime: estimatedTime.trim(),
        message: message.trim(),
        includesMaterials,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit bid';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider font-bold">
              <Gavel className="w-4 h-4" />
              Official Worker Proposal
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight font-heading mt-0.5 text-white">
              Submit Competitive Bid
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-heading uppercase text-slate-900">
              Bid Submitted Successfully!
            </h3>
            <p className="text-slate-600 max-w-md mx-auto text-sm">
              Your quote of <strong className="text-emerald-700">${numPrice}</strong> has been sent to{' '}
              <strong className="text-slate-900">{job.customerName}</strong>. You will be notified
              as soon as the customer reviews and selects a pro.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Job Summary Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${categoryMeta.badgeBg} ${categoryMeta.badgeText}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {job.category}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-600 font-medium">{job.location}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs font-mono font-bold text-amber-700">{job.urgency}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-heading leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{job.description}</p>
                </div>
                <div className="text-right shrink-0 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    Customer Budget
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900">
                    ${job.budget}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {job.bids.length} existing bid{job.bids.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>

            {/* Select Bidding Worker Profile */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                  Submitting As Worker Profile
                </label>
                <span className="text-xs text-slate-500">Change pro:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {workers.map((w) => {
                  const isSelected = activeWorker.id === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onSelectWorker(w)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 truncate">{w.name}</div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span>{w.rating}</span> · <span>{w.category}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                  {errors.form}
                </div>
              )}

              {/* Price & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Proposed Bid Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
                    Your Proposed Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono text-base">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="5"
                      value={proposedPrice}
                      onChange={(e) => {
                        setProposedPrice(e.target.value);
                        if (errors.price) setErrors({ ...errors, price: '' });
                      }}
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.price ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                      }`}
                    />
                  </div>

                  {/* Real-time comparison */}
                  <div className="mt-1.5">
                    {budgetDiff > 0 ? (
                      <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>${budgetDiff} under customer budget (Competitive!)</span>
                      </div>
                    ) : budgetDiff === 0 ? (
                      <div className="text-xs text-sky-700 font-medium">
                        Matches customer budget exactly (${job.budget})
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 font-medium">
                        +${Math.abs(budgetDiff)} over budget (High-end parts / warranty)
                      </div>
                    )}
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.price}
                    </p>
                  )}
                </div>

                {/* Estimated Completion Timeline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
                    Estimated Start / Completion <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => {
                        setEstimatedTime(e.target.value);
                        if (errors.time) setErrors({ ...errors, time: '' });
                      }}
                      placeholder="e.g. Can arrive in 45 mins, 2 hours work"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.time ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setEstimatedTime('Within 2 hours')}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Within 2 hrs
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedTime('Tomorrow morning (9 AM)')}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Tomorrow 9 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedTime('This Saturday (flexible)')}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      This Weekend
                    </button>
                  </div>
                  {errors.time && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Proposal Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                    Pitch & Proposal Message <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {message.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  placeholder="Explain why you are the best fit for this job, your relevant tools/experience, warranty, and availability..."
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.message ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}

                {/* Quick Templates */}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono self-center">
                    Templates:
                  </span>
                  {templateMessages.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMessage(tpl)}
                      className="text-[10px] px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 truncate max-w-xs"
                      title={tpl}
                    >
                      {tpl.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Includes Materials Checkbox */}
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={includesMaterials}
                  onChange={(e) => setIncludesMaterials(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">
                    Includes all standard parts & materials
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Customer does not need to purchase hardware, fittings, or supplies separately.
                  </p>
                </div>
              </label>

              {/* Submit CTA */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-all transform active:scale-95 uppercase tracking-wide font-heading disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Submitting Bid...</span>
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4 text-amber-400" />
                      <span>Place Bid (${numPrice || 0})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
