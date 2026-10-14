import React, { useState } from 'react';
import { Job, CustomerProfile, WorkerProfile, JobStatus } from '../types';
import { JobCard } from './JobCard';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  FolderOpen,
  DollarSign,
  UserCheck,
} from 'lucide-react';

interface CustomerDashboardProps {
  customer: CustomerProfile;
  jobs: Job[];
  onOpenPostJob: () => void;
  onOpenBidModal: (job: Job) => void;
  onOpenCompareModal: (job: Job) => void;
  onOpenCompleteModal: (job: Job) => void;
  activeWorker: WorkerProfile;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customer,
  jobs,
  onOpenPostJob,
  onOpenBidModal,
  onOpenCompareModal,
  onOpenCompleteModal,
  activeWorker,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Customer's jobs
  const customerJobs = jobs.filter((j) => j.customerId === customer.id);

  // Statistics
  const openCount = customerJobs.filter((j) => j.status === 'Open').length;
  const inProgressCount = customerJobs.filter((j) => j.status === 'Worker Selected').length;
  const completedCount = customerJobs.filter((j) => j.status === 'Completed').length;
  const totalBidsReceived = customerJobs.reduce((sum, j) => sum + j.bids.length, 0);

  // Filtered jobs
  const filteredJobs = customerJobs.filter((job) => {
    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Customer Persona Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Customer Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">{customer.neighborhood}</span>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900 font-heading mt-1">
              {customer.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your household service postings, review competitive bids, and select verified pros.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPostJob}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-lg shadow-sm transition-all transform active:scale-95 uppercase tracking-wide font-heading"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
            Total Posted Requests
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
            {customerJobs.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Lifetime community jobs</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">
            Open For Bids
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 mt-1 block">
            {openCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Accepting worker proposals
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-sky-700 block">
            Worker Assigned
          </span>
          <span className="text-2xl font-extrabold font-mono text-sky-600 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Work in progress</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
            Pro Bids Received
          </span>
          <span className="text-2xl font-extrabold font-mono text-amber-600 mt-1 block">
            {totalBidsReceived}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across all posted jobs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors uppercase font-heading ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Jobs ({customerJobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('Open')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors uppercase font-heading ${
              statusFilter === 'Open'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter('Worker Selected')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors uppercase font-heading ${
              statusFilter === 'Worker Selected'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors uppercase font-heading ${
              statusFilter === 'Completed'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Jobs Grid or Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-heading">
            No Jobs Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? `No jobs match "${searchQuery}". Try clearing search.`
              : `You don't have any jobs marked as ${statusFilter}. Post a new household job to receive competitive quotes.`}
          </p>
          <button
            onClick={onOpenPostJob}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg uppercase tracking-wider font-heading"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              currentRole="customer"
              activeWorker={activeWorker}
              activeCustomer={customer}
              onOpenBidModal={onOpenBidModal}
              onOpenCompareModal={onOpenCompareModal}
              onOpenCompleteModal={onOpenCompleteModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
