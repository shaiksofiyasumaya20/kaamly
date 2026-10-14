import React, { useState } from 'react';
import { Job, WorkerProfile, CustomerProfile, JobCategory, JobStatus } from '../types';
import { JobCard } from './JobCard';
import { CATEGORIES } from '../utils/categories';
import {
  Search,
  SlidersHorizontal,
  PlusCircle,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface MarketplaceFeedProps {
  jobs: Job[];
  currentRole: 'customer' | 'worker';
  activeWorker: WorkerProfile;
  activeCustomer: CustomerProfile;
  onOpenBidModal: (job: Job) => void;
  onOpenCompareModal: (job: Job) => void;
  onOpenCompleteModal: (job: Job) => void;
  onOpenPostJob: () => void;
}

export const MarketplaceFeed: React.FC<MarketplaceFeedProps> = ({
  jobs,
  currentRole,
  activeWorker,
  activeCustomer,
  onOpenBidModal,
  onOpenCompareModal,
  onOpenCompleteModal,
  onOpenPostJob,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'budget-high' | 'budget-low' | 'most-bids'>(
    'newest'
  );

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.neighborhood.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  // Sort
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'budget-high':
        return b.budget - a.budget;
      case 'budget-low':
        return a.budget - b.budget;
      case 'most-bids':
        return b.bids.length - a.bids.length;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const openCount = jobs.filter((j) => j.status === 'Open').length;
  const inProgressCount = jobs.filter((j) => j.status === 'Worker Selected').length;
  const completedCount = jobs.filter((j) => j.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Fair, Transparent Community Bidding
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight font-heading leading-tight text-white">
            Household Services, <span className="text-amber-400">Competitive Bids</span>, Local Trust.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Need home repairs or routine maintenance? Post your requirements in 60 seconds. Local
            licensed plumbers, electricians, cleaners, and carpenters compete by offering their best
            prices.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free for Homeowners</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Multi-Bid Price Comparison</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Verified Local Neighborhood Pros</span>
            </div>
          </div>
        </div>

        {/* Decorative subtle background grid element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Category Pills Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <span className="text-xs font-bold uppercase font-heading text-slate-500 tracking-wider">
            Explore By Service Trade
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {jobs.length} total jobs in system
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wide font-heading ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Services ({jobs.length})
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = jobs.filter((j) => j.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-amber-700 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Status & Sorting Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keywords, neighborhood, repair description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors font-heading uppercase whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('Open')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors font-heading uppercase whitespace-nowrap ${
              statusFilter === 'Open'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter('Worker Selected')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors font-heading uppercase whitespace-nowrap ${
              statusFilter === 'Worker Selected'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors font-heading uppercase whitespace-nowrap ${
              statusFilter === 'Completed'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'newest' | 'budget-high' | 'budget-low' | 'most-bids')
            }
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="newest">Newest First</option>
            <option value="budget-high">Highest Budget</option>
            <option value="budget-low">Lowest Budget</option>
            <option value="most-bids">Most Bids</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{sortedJobs.length}</strong> matching request
          {sortedJobs.length === 1 ? '' : 's'}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        </span>
        {(selectedCategory !== 'All' || statusFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      {sortedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-heading">
            No Requests Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            No active jobs match the chosen category or search criteria. Try selecting another
            category or posting a new service request.
          </p>
          <button
            onClick={onOpenPostJob}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg uppercase tracking-wider font-heading"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post This Job</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              currentRole={currentRole}
              activeWorker={activeWorker}
              activeCustomer={activeCustomer}
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
