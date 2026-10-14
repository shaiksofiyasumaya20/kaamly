import React, { useState } from 'react';
import { Job } from '../types';
import {
  X,
  Star,
  CheckCircle2,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface CompleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onComplete: (jobId: string, rating: number, comment: string) => Promise<void>;
}

export const CompleteJobModal: React.FC<CompleteJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onComplete,
}) => {
  if (!isOpen || !job) return null;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Outstanding workmanship! Arrived promptly, fixed the issue cleanly, and tested everything before leaving.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a short review comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(job.id, rating, comment.trim());
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to mark job as complete';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold uppercase tracking-tight font-heading text-white">
              Complete Job & Review Worker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Completed by Pro:{' '}
              <strong className="text-slate-800">
                {job.selectedWorker?.workerName || 'Assigned Worker'}
              </strong>
            </p>
          </div>

          {/* Star Rating Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-2">
              Overall Work Quality & Satisfaction
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold font-mono text-slate-700">
                {rating === 5
                  ? '5.0 ★ Excellent'
                  : rating === 4
                  ? '4.0 ★ Good'
                  : rating === 3
                  ? '3.0 ★ Average'
                  : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Review comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-1.5">
              Public Testimonial / Community Review
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder="Describe timeliness, cleanup, communication, and quality..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all uppercase tracking-wide font-heading disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Completed & Publish Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
