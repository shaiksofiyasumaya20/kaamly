import React, { useState, useEffect } from 'react';
import { Job, WorkerProfile, CustomerProfile, JobCategory } from './types';
import { api } from './services/api';
import { INITIAL_WORKERS, INITIAL_CUSTOMERS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { PostJobModal } from './components/PostJobModal';
import { BidModal } from './components/BidModal';
import { BidComparisonModal } from './components/BidComparisonModal';
import { CompleteJobModal } from './components/CompleteJobModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import {
  Hammer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  RotateCcw,
  ShieldCheck,
  Heart,
  Gavel,
} from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>(INITIAL_WORKERS);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);

  // Active Personas
  const [currentRole, setCurrentRole] = useState<'customer' | 'worker'>('customer');
  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile>(INITIAL_CUSTOMERS[0]);
  const [activeWorker, setActiveWorker] = useState<WorkerProfile>(INITIAL_WORKERS[0]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'browse' | 'customer-dash' | 'worker-dash'>('browse');

  // Modals state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [bidModalJob, setBidModalJob] = useState<Job | null>(null);
  const [compareModalJob, setCompareModalJob] = useState<Job | null>(null);
  const [completeModalJob, setCompleteModalJob] = useState<Job | null>(null);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isSelectingBidId, setIsSelectingBidId] = useState<string | null>(null);

  // Loading & Toast state
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load jobs on mount
  const refreshJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
      // Also update currently inspected jobs in modals if open
      if (compareModalJob) {
        const updated = data.find((j) => j.id === compareModalJob.id);
        if (updated) setCompareModalJob(updated);
      }
    } catch (e) {
      console.error('Failed to load jobs:', e);
      showToast('Offline mode: Using cached data', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshJobs();
    api.getWorkers().then((w) => {
      if (w && w.length) setWorkers(w);
    });
  }, []);

  // Post Job
  const handleCreateJob = async (jobData: {
    title: string;
    category: JobCategory;
    description: string;
    location: string;
    neighborhood?: string;
    budget: number;
    urgency: 'Emergency / Today' | 'Within 48 Hours' | 'This Week' | 'Flexible';
    customerId: string;
    customerName: string;
    customerPhone?: string;
  }) => {
    const created = await api.createJob(jobData);
    await refreshJobs();
    showToast(`Job "${created.title.slice(0, 30)}..." published! Bidding is now open.`);
    setActiveTab('customer-dash');
    setCurrentRole('customer');
  };

  // Submit Bid
  const handleSubmitBid = async (
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
  ) => {
    await api.submitBid(jobId, bidData);
    await refreshJobs();
    showToast(
      `Your bid of $${bidData.proposedPrice} was submitted to customer!`,
      'success'
    );
  };

  // Select Worker
  const handleSelectWorker = async (jobId: string, bidId: string) => {
    setIsSelectingBidId(bidId);
    try {
      const updated = await api.selectWorker(jobId, bidId);
      await refreshJobs();
      setCompareModalJob(updated);
      showToast(
        `Pro ${updated.selectedWorker?.workerName} selected! Job is now In Progress.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error selecting pro';
      showToast(msg, 'error');
    } finally {
      setIsSelectingBidId(null);
    }
  };

  // Mark Job Completed
  const handleCompleteJob = async (jobId: string, rating: number, comment: string) => {
    const updated = await api.completeJob(jobId, rating, comment);
    await refreshJobs();
    setCompareModalJob(null);
    showToast('Job marked as completed & review saved!', 'success');
  };

  // Reset Data
  const handleResetData = async () => {
    setIsLoading(true);
    await api.resetData();
    await refreshJobs();
    showToast('Platform reset to initial seed data.', 'info');
  };

  const openJobsCount = jobs.filter((j) => j.status === 'Open').length;
  const customerJobsCount = jobs.filter((j) => j.customerId === activeCustomer.id).length;
  const workerBidsCount = jobs.filter((j) =>
    j.bids.some((b) => b.workerId === activeWorker.id)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeCustomer={activeCustomer}
        activeWorker={activeWorker}
        workers={workers}
        customers={customers}
        onSelectWorker={(w) => setActiveWorker(w)}
        onSelectCustomer={(c) => setActiveCustomer(c)}
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onResetData={handleResetData}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        openJobsCount={openJobsCount}
        customerJobsCount={customerJobsCount}
        workerBidsCount={workerBidsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
              Connecting to LocalLink Community Engine...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'browse' && (
              <MarketplaceFeed
                jobs={jobs}
                currentRole={currentRole}
                activeWorker={activeWorker}
                activeCustomer={activeCustomer}
                onOpenBidModal={(job) => setBidModalJob(job)}
                onOpenCompareModal={(job) => setCompareModalJob(job)}
                onOpenCompleteModal={(job) => setCompleteModalJob(job)}
                onOpenPostJob={() => setIsPostJobOpen(true)}
              />
            )}

            {activeTab === 'customer-dash' && (
              <CustomerDashboard
                customer={activeCustomer}
                jobs={jobs}
                onOpenPostJob={() => setIsPostJobOpen(true)}
                onOpenBidModal={(job) => setBidModalJob(job)}
                onOpenCompareModal={(job) => setCompareModalJob(job)}
                onOpenCompleteModal={(job) => setCompleteModalJob(job)}
                activeWorker={activeWorker}
              />
            )}

            {activeTab === 'worker-dash' && (
              <WorkerDashboard
                worker={activeWorker}
                jobs={jobs}
                onOpenBidModal={(job) => setBidModalJob(job)}
                onOpenCompareModal={(job) => setCompareModalJob(job)}
                onOpenCompleteModal={(job) => setCompleteModalJob(job)}
                activeCustomer={activeCustomer}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onSubmit={handleCreateJob}
        activeCustomer={activeCustomer}
      />

      <BidModal
        isOpen={Boolean(bidModalJob)}
        onClose={() => setBidModalJob(null)}
        job={bidModalJob}
        activeWorker={activeWorker}
        workers={workers}
        onSelectWorker={(w) => setActiveWorker(w)}
        onSubmitBid={handleSubmitBid}
      />

      <BidComparisonModal
        isOpen={Boolean(compareModalJob)}
        onClose={() => setCompareModalJob(null)}
        job={compareModalJob}
        onSelectWorker={handleSelectWorker}
        onOpenCompleteModal={(j) => {
          setCompareModalJob(null);
          setCompleteModalJob(j);
        }}
        isSelectingBidId={isSelectingBidId}
      />

      <CompleteJobModal
        isOpen={Boolean(completeModalJob)}
        onClose={() => setCompleteModalJob(null)}
        job={completeModalJob}
        onComplete={handleCompleteJob}
      />

      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 text-amber-400 rounded-lg flex items-center justify-center font-bold">
                  <Hammer className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold uppercase font-heading text-slate-900 tracking-tight">
                  Local<span className="text-amber-600">Link</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                A community-service bidding marketplace empowering homeowners and local trade
                specialists through direct, transparent price competition.
              </p>
            </div>

            {/* Col 2: Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading mb-3">
                Core Trades
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>Plumbing Repairs & Drains</li>
                <li>Electrical Fixtures & Lighting</li>
                <li>Residential Deep Cleaning</li>
                <li>Custom Carpentry & Shelving</li>
                <li>Interior Wall Painting</li>
              </ul>
            </div>

            {/* Col 3: Community Guarantees */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading mb-3">
                Platform Rules
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>✓ Zero homeowner posting fees</li>
                <li>✓ Transparent side-by-side bids</li>
                <li>✓ Verified license & rating badges</li>
                <li>✓ Customer milestone sign-off</li>
              </ul>
            </div>

            {/* Col 4: Developer & Sync */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading mb-3">
                Project Access
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setIsDeployGuideOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg font-heading uppercase tracking-wide transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  GitHub & Deploy Guide
                </button>
                <button
                  onClick={handleResetData}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Reset Seed Records
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © {new Date().getFullYear()} LocalLink Community Services. All rights reserved.
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              Built with precision for verified community trade professionals.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
