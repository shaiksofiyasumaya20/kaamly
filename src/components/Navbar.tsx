import React from 'react';
import { CustomerProfile, WorkerProfile } from '../types';
import {
  Hammer,
  PlusCircle,
  Briefcase,
  UserCheck,
  RotateCcw,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentRole: 'customer' | 'worker';
  onRoleChange: (role: 'customer' | 'worker') => void;
  activeCustomer: CustomerProfile;
  activeWorker: WorkerProfile;
  workers: WorkerProfile[];
  customers: CustomerProfile[];
  onSelectWorker: (worker: WorkerProfile) => void;
  onSelectCustomer: (customer: CustomerProfile) => void;
  onOpenPostJob: () => void;
  onOpenDeployGuide: () => void;
  onResetData: () => void;
  activeTab: 'browse' | 'customer-dash' | 'worker-dash';
  onNavigateTab: (tab: 'browse' | 'customer-dash' | 'worker-dash') => void;
  openJobsCount: number;
  customerJobsCount: number;
  workerBidsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeCustomer,
  activeWorker,
  workers,
  customers,
  onSelectWorker,
  onSelectCustomer,
  onOpenPostJob,
  onOpenDeployGuide,
  onResetData,
  activeTab,
  onNavigateTab,
  openJobsCount,
  customerJobsCount,
  workerBidsCount,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner / Announcement */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LocalLink Network Active
          </span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline text-slate-400">
            {openJobsCount} Open Jobs · Verified Local Trades
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={onOpenDeployGuide}
            className="hover:text-white transition-colors flex items-center gap-1 underline underline-offset-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            GitHub & Deploy Docs
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => {
              if (confirm('Reset demo database to original seed state?')) {
                onResetData();
              }
            }}
            title="Reset database data to default seed"
            className="hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateTab('browse')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 bg-slate-900 text-amber-400 rounded-lg flex items-center justify-center font-bold shadow-sm group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-heading uppercase block leading-none">
                  Local<span className="text-amber-600">Link</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase block mt-0.5">
                  Community Bidding
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigateTab('browse')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Marketplace
              </button>

              <button
                onClick={() => {
                  onRoleChange('customer');
                  onNavigateTab('customer-dash');
                }}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'customer-dash' && currentRole === 'customer'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-700" />
                Customer Dashboard
                {customerJobsCount > 0 && (
                  <span className="text-xs px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded font-mono font-bold">
                    {customerJobsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onRoleChange('worker');
                  onNavigateTab('worker-dash');
                }}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'worker-dash' && currentRole === 'worker'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                Worker Dashboard
                {workerBidsCount > 0 && (
                  <span className="text-xs px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded font-mono font-bold">
                    {workerBidsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Controls: Role Switcher & Post Job CTA */}
          <div className="flex items-center gap-3">
            {/* Role Persona Toggle Switch */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-slate-400 text-left transition-all shadow-xs"
              >
                {currentRole === 'customer' ? (
                  <>
                    <img
                      src={activeCustomer.avatar}
                      alt={activeCustomer.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                        Customer View
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {activeCustomer.name}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={activeWorker.avatar}
                      alt={activeWorker.name}
                      className="w-7 h-7 rounded-full object-cover border border-amber-300"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                        Worker View (Pro)
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {activeWorker.name}
                      </div>
                    </div>
                  </>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              {/* Persona Switcher Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                        Select Active Role & Persona
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Test bidding from customer or worker sides
                      </p>
                    </div>

                    {/* Customer Personas */}
                    <div className="p-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-amber-800 px-2 py-0.5 block">
                        Customer Accounts (Post & Hire)
                      </span>
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSelectCustomer(c);
                            onRoleChange('customer');
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full mt-1 flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            currentRole === 'customer' && activeCustomer.id === c.id
                              ? 'bg-amber-50 font-bold text-amber-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1 truncate">
                            <span className="block truncate">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal block truncate">
                              {c.neighborhood}
                            </span>
                          </div>
                          {currentRole === 'customer' && activeCustomer.id === c.id && (
                            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Worker Personas */}
                    <div className="p-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 px-2 py-0.5 block">
                        Worker Accounts (Browse & Bid)
                      </span>
                      {workers.slice(0, 4).map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            onSelectWorker(w);
                            onRoleChange('worker');
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full mt-1 flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            currentRole === 'worker' && activeWorker.id === w.id
                              ? 'bg-emerald-50 font-bold text-emerald-950'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img
                            src={w.avatar}
                            alt={w.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1 truncate">
                            <span className="block truncate">{w.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal block truncate">
                              {w.category} · {w.rating}★ ({w.completedJobsCount} jobs)
                            </span>
                          </div>
                          {currentRole === 'worker' && activeWorker.id === w.id && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Post Job Primary CTA Button */}
            <button
              onClick={onOpenPostJob}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-lg shadow-sm transition-all transform active:scale-95 uppercase tracking-wide font-heading"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 px-2 py-1.5">
        <button
          onClick={() => onNavigateTab('browse')}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded ${
            activeTab === 'browse' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => {
            onRoleChange('customer');
            onNavigateTab('customer-dash');
          }}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded ${
            activeTab === 'customer-dash' ? 'bg-amber-100 text-amber-900' : 'text-slate-600'
          }`}
        >
          Customer ({customerJobsCount})
        </button>
        <button
          onClick={() => {
            onRoleChange('worker');
            onNavigateTab('worker-dash');
          }}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded ${
            activeTab === 'worker-dash' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Worker ({workerBidsCount})
        </button>
      </div>
    </header>
  );
};
