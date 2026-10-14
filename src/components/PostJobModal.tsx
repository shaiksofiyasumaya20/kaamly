import React, { useState } from 'react';
import { CustomerProfile, JobCategory } from '../types';
import { CATEGORIES } from '../utils/categories';
import {
  X,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  MapPin,
  Clock,
  Briefcase,
  FileText,
  User,
  Loader2,
} from 'lucide-react';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: {
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
  }) => Promise<void>;
  activeCustomer: CustomerProfile;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activeCustomer,
}) => {
  const [category, setCategory] = useState<JobCategory>('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(activeCustomer.location);
  const [neighborhood, setNeighborhood] = useState(activeCustomer.neighborhood);
  const [budget, setBudget] = useState<string>('150');
  const [urgency, setUrgency] = useState<
    'Emergency / Today' | 'Within 48 Hours' | 'This Week' | 'Flexible'
  >('Within 48 Hours');
  const [customerName, setCustomerName] = useState(activeCustomer.name);
  const [customerPhone, setCustomerPhone] = useState(activeCustomer.phone);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Job title is required';
    } else if (title.trim().length < 8) {
      errs.title = 'Title must be at least 8 characters (e.g. "Install 6 Recessed LED Ceiling Lights")';
    }

    if (!description.trim()) {
      errs.description = 'Please describe the problem or work needed';
    } else if (description.trim().length < 20) {
      errs.description = 'Please provide at least 20 characters so local workers can submit accurate bids';
    }

    if (!location.trim()) {
      errs.location = 'Job location address is required';
    }

    const numBudget = Number(budget);
    if (!budget || isNaN(numBudget) || numBudget <= 0) {
      errs.budget = 'Please enter a valid target budget in dollars';
    } else if (numBudget < 25) {
      errs.budget = 'Minimum recommended budget is $25 for quality work';
    }

    if (!customerName.trim()) {
      errs.customerName = 'Customer name is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        neighborhood: neighborhood.trim() || location.split(',')[0].trim(),
        budget: Number(budget),
        urgency,
        customerId: activeCustomer.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setBudget('150');
        setErrors({});
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish job. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetSuggestions = [80, 150, 300, 500, 850];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider font-bold">
              <PlusCircle className="w-4 h-4" />
              Direct Community Service Request
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight font-heading mt-0.5 text-white">
              Post a Household Service Job
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
              Job Published Successfully!
            </h3>
            <p className="text-slate-600 max-w-md mx-auto text-sm">
              Your request is now live in the LocalLink marketplace. Local workers in{' '}
              <strong className="text-slate-900">{neighborhood || location}</strong> have been
              notified and can start submitting bids.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* 1. Category Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-2">
                1. Select Service Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1.5 transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            isSelected ? 'text-amber-950' : 'text-slate-800'
                          }`}
                        >
                          {cat.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Job Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                  2. Job Title / Summary <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {title.length} characters
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder="e.g. Fix leaking PVC trap under kitchen sink, or Install 4 ceiling fans"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    errors.title ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* 3. Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                  3. Detailed Description & Requirements <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {description.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Explain the work required, current condition, whether you have materials on-site, access instructions, and any special requests..."
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  errors.description ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* 4. Budget & Urgency Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Budget */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
                  4. Maximum Budget (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={budget}
                    onChange={(e) => {
                      setBudget(e.target.value);
                      if (errors.budget) setErrors({ ...errors, budget: '' });
                    }}
                    placeholder="180"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm font-semibold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      errors.budget ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Quick:</span>
                  {budgetSuggestions.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudget(amt.toString())}
                      className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                {errors.budget && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.budget}
                  </p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
                  5. Timing / Urgency
                </label>
                <div className="relative">
                  <select
                    value={urgency}
                    onChange={(e) =>
                      setUrgency(
                        e.target.value as
                          | 'Emergency / Today'
                          | 'Within 48 Hours'
                          | 'This Week'
                          | 'Flexible'
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Emergency / Today">🚨 Emergency / Today</option>
                    <option value="Within 48 Hours">⚡ Within 48 Hours</option>
                    <option value="This Week">📅 This Week</option>
                    <option value="Flexible">🌿 Flexible (Best Price)</option>
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Workers see your deadline to submit realistic timeline bids.
                </p>
              </div>
            </div>

            {/* 5. Location & Neighborhood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
                  6. Street Address / Area <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({ ...errors, location: '' });
                    }}
                    placeholder="e.g. 104 Willow Brook Rd"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.location ? 'border-red-400' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
                  Neighborhood / Ward
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. Maplewood North"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Customer Contact Confirmation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">
                  Posting as: <strong className="text-slate-900">{customerName}</strong> (
                  {customerPhone || 'Contact verified'})
                </span>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold uppercase">
                Free to Post · Zero Platform Fee
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
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
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-lg shadow-sm transition-all transform active:scale-95 uppercase tracking-wide font-heading disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Job & Request Bids</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
