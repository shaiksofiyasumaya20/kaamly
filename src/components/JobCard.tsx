import React from 'react';
import { Job, WorkerProfile, CustomerProfile } from '../types';
import { getCategoryMeta } from '../utils/categories';
import {
  MapPin,
  Clock,
  DollarSign,
  Gavel,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
  ShieldCheck,
  User,
  ArrowRight,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  currentRole: 'customer' | 'worker';
  activeWorker: WorkerProfile;
  activeCustomer: CustomerProfile;
  onOpenBidModal: (job: Job) => void;
  onOpenCompareModal: (job: Job) => void;
  onOpenCompleteModal: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  currentRole,
  activeWorker,
  activeCustomer,
  onOpenBidModal,
  onOpenCompareModal,
  onOpenCompleteModal,
}) => {
  const categoryMeta = getCategoryMeta(job.category);
  const CategoryIcon = categoryMeta.icon;

  // Check if current active worker has already bid on this job
  const existingWorkerBid = job.bids.find((b) => b.workerId === activeWorker.id);

  // Check if current customer posted this job
  const isCustomerOwner = job.customerId === activeCustomer.id;

  const lowestBid =
    job.bids.length > 0 ? Math.min(...job.bids.map((b) => b.proposedPrice)) : null;

  // Status badge styling
  const getStatusBadge = () => {
    switch (job.status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Open for Bids
          </span>
        );
      case 'Worker Selected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Worker Selected
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Details */}
      <div className="p-5">
        {/* Category & Status Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${categoryMeta.badgeBg} ${categoryMeta.badgeText} ${categoryMeta.borderColor}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" />
              {job.category}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {job.neighborhood}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors font-heading leading-snug line-clamp-2">
          {job.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Metadata grid */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end text-right font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate text-amber-800 font-semibold">{job.urgency}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Budget and Bids Info */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono leading-none">
            Customer Budget
          </div>
          <div className="text-lg font-extrabold font-mono text-slate-900 leading-tight">
            ${job.budget}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {job.bids.length === 0 ? (
              <span className="text-amber-700 font-semibold">0 bids · Be the first!</span>
            ) : (
              <span>
                {job.bids.length} bid{job.bids.length === 1 ? '' : 's'}
                {lowestBid ? ` · from $${lowestBid}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Action Button */}
        <div>
          {currentRole === 'customer' ? (
            /* Customer View Action */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenCompareModal(job)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-xs transition-all uppercase tracking-wider font-heading ${
                  job.status === 'Open'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : job.status === 'Worker Selected'
                    ? 'bg-sky-700 hover:bg-sky-800 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {job.status === 'Open'
                    ? `Compare Bids (${job.bids.length})`
                    : job.status === 'Worker Selected'
                    ? 'Manage Contract'
                    : 'View Summary'}
                </span>
              </button>

              {job.status === 'Worker Selected' && isCustomerOwner && (
                <button
                  type="button"
                  onClick={() => onOpenCompleteModal(job)}
                  title="Mark this job as completed"
                  className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* Worker View Action */
            <div>
              {job.status !== 'Open' ? (
                <button
                  type="button"
                  onClick={() => onOpenCompareModal(job)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              ) : existingWorkerBid ? (
                <button
                  type="button"
                  onClick={() => onOpenCompareModal(job)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bid Placed (${existingWorkerBid.proposedPrice})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenBidModal(job)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-all uppercase tracking-wider font-heading"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Submit Bid</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
