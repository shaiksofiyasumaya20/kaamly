import React, { useState } from 'react';
import { Job, WorkerProfile, CustomerProfile, Bid } from '../types';
import { JobCard } from './JobCard';
import { getCategoryMeta } from '../utils/categories';
import {
  Briefcase,
  Star,
  CheckCircle2,
  Clock,
  DollarSign,
  Gavel,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ChevronRight,
  Eye,
  Award,
  Phone,
  FileCheck,
} from 'lucide-react';

interface WorkerDashboardProps {
  worker: WorkerProfile;
  jobs: Job[];
  onOpenBidModal: (job: Job) => void;
  onOpenCompareModal: (job: Job) => void;
  onOpenCompleteModal: (job: Job) => void;
  activeCustomer: CustomerProfile;
  onNavigateTab: (tab: 'browse' | 'customer-dash' | 'worker-dash') => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  worker,
  jobs,
  onOpenBidModal,
  onOpenCompareModal,
  onOpenCompleteModal,
  activeCustomer,
  onNavigateTab,
}) => {
  const [workerTab, setWorkerTab] = useState<'bids' | 'contracts' | 'feed'>('bids');

  // Extract all bids placed by this worker
  const myBidsWithJob: { bid: Bid; job: Job }[] = [];
  jobs.forEach((job) => {
    const foundBid = job.bids.find((b) => b.workerId === worker.id);
    if (foundBid) {
      myBidsWithJob.push({ bid: foundBid, job });
    }
  });

  // Contracts won: jobs where this worker was selected
  const activeContracts = jobs.filter(
    (j) => j.selectedWorker && j.selectedWorker.workerId === worker.id
  );

  const pendingBidsCount = myBidsWithJob.filter((b) => b.bid.status === 'pending').length;
  const wonContractsCount = activeContracts.length;
  const totalAgreedRevenue = activeContracts.reduce(
    (sum, j) => sum + (j.selectedWorker?.agreedPrice || 0),
    0
  );

  // Available open jobs in market (where worker hasn't bid yet)
  const availableOpenJobs = jobs.filter(
    (j) => j.status === 'Open' && !j.bids.some((b) => b.workerId === worker.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Worker Profile Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {worker.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {worker.yearsExperience} Years Experience
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">Rate: ${worker.hourlyBenchmark}/hr</span>
              </div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-heading mt-1">
                {worker.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="font-semibold text-amber-300">{worker.tradeTitle}</span>
                <span>·</span>
                <div className="flex items-center gap-0.5 text-amber-400 font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">
                    ({worker.completedJobsCount} jobs completed)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => onNavigateTab('browse')}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-lg shadow-sm transition-all transform active:scale-95 uppercase tracking-wide font-heading"
            >
              <Gavel className="w-4 h-4" />
              <span>Browse Open Jobs</span>
            </button>
          </div>
        </div>

        {/* Worker Bio Quote */}
        <p className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 italic max-w-3xl">
          "{worker.bio}"
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
            Bids Placed
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
            {myBidsWithJob.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {pendingBidsCount} awaiting customer review
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">
            Jobs Awarded
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 mt-1 block">
            {wonContractsCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Selected by customer
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-700 block">
            Contract Revenue
          </span>
          <span className="text-2xl font-extrabold font-mono text-amber-600 mt-1 block">
            ${totalAgreedRevenue}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">From won contracts</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-sky-700 block">
            New Market Opportunities
          </span>
          <span className="text-2xl font-extrabold font-mono text-sky-600 mt-1 block">
            {availableOpenJobs.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Jobs ready for bids</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setWorkerTab('bids')}
          className={`pb-3 text-sm font-bold uppercase font-heading tracking-wide transition-colors relative ${
            workerTab === 'bids'
              ? 'text-slate-900 border-b-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Submitted Proposals ({myBidsWithJob.length})
        </button>

        <button
          onClick={() => setWorkerTab('contracts')}
          className={`pb-3 text-sm font-bold uppercase font-heading tracking-wide transition-colors relative ${
            workerTab === 'contracts'
              ? 'text-slate-900 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Contracts Won ({activeContracts.length})
        </button>

        <button
          onClick={() => setWorkerTab('feed')}
          className={`pb-3 text-sm font-bold uppercase font-heading tracking-wide transition-colors relative ${
            workerTab === 'feed'
              ? 'text-slate-900 border-b-2 border-sky-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Quick Bidding Feed ({availableOpenJobs.length})
        </button>
      </div>

      {/* TAB 1: My Submitted Bids */}
      {workerTab === 'bids' && (
        <div className="space-y-4">
          {myBidsWithJob.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                <Gavel className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-heading">
                No Proposals Placed Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Browse open household jobs in your neighborhood and place competitive bids to win
                contracts.
              </p>
              <button
                onClick={() => setWorkerTab('feed')}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-lg"
              >
                Find Jobs to Bid On
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myBidsWithJob.map(({ bid, job }) => {
                const categoryMeta = getCategoryMeta(job.category);
                const isAccepted = bid.status === 'accepted';
                const isRejected = bid.status === 'rejected';

                return (
                  <div
                    key={bid.id}
                    className={`p-5 bg-white rounded-xl border transition-all ${
                      isAccepted
                        ? 'border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs'
                        : isRejected
                        ? 'border-slate-200 opacity-70'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Job & Bid info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${categoryMeta.badgeBg} ${categoryMeta.badgeText}`}
                          >
                            {job.category}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{job.neighborhood}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">
                            Customer: {job.customerName}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 font-heading">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                          <span>
                            Customer Budget:{' '}
                            <strong className="font-mono text-slate-900">${job.budget}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Your Proposed Quote:{' '}
                            <strong className="font-mono text-emerald-700 text-sm">
                              ${bid.proposedPrice}
                            </strong>
                          </span>
                          <span>·</span>
                          <span className="text-slate-400 font-mono">
                            Submitted {new Date(bid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isAccepted ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider font-heading">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Contract Won!
                            </span>
                            <div className="text-[10px] text-emerald-800 font-semibold mt-1">
                              Customer selected your bid
                            </div>
                          </div>
                        ) : isRejected ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg">
                              Another Pro Selected
                            </span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg uppercase tracking-wider font-heading">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Under Review
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {job.bids.length} competing pro{job.bids.length === 1 ? '' : 's'}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => onOpenCompareModal(job)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="View job"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Proposal message snippet */}
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg flex items-start gap-2">
                      <span className="text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">
                        Pitch:
                      </span>
                      <p className="line-clamp-1 italic">"{bid.message}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Active Contracts Won */}
      {workerTab === 'contracts' && (
        <div className="space-y-4">
          {activeContracts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-heading">
                No Active Contracts Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                When a customer reviews your proposal and clicks "Select Pro", the job will appear
                here with full customer address and contact info.
              </p>
              <button
                onClick={() => setWorkerTab('feed')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs uppercase rounded-lg"
              >
                Browse Open Opportunities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContracts.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          {job.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {job.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 font-heading">
                        {job.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                        Agreed Pay
                      </span>
                      <span className="text-xl font-extrabold font-mono text-emerald-700">
                        ${job.selectedWorker?.agreedPrice}
                      </span>
                    </div>
                  </div>

                  {/* Customer Contact & Address info */}
                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Customer: {job.customerName} · {job.customerPhone || '(555) Verified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 font-mono">
                      Urgency: {job.urgency}
                    </span>
                    <button
                      onClick={() => onOpenCompareModal(job)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg uppercase tracking-wide font-heading"
                    >
                      View Contract Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Quick Bidding Feed */}
      {workerTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 font-heading">
              Open Marketplace Requests ({availableOpenJobs.length})
            </h3>
            <span className="text-xs text-slate-500">
              Submit your price and estimated schedule
            </span>
          </div>

          {availableOpenJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 font-heading uppercase">
                You've Bid On All Open Jobs!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Check back shortly as new local residents post household repair and maintenance jobs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableOpenJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  currentRole="worker"
                  activeWorker={worker}
                  activeCustomer={activeCustomer}
                  onOpenBidModal={onOpenBidModal}
                  onOpenCompareModal={onOpenCompareModal}
                  onOpenCompleteModal={onOpenCompleteModal}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
