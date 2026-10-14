import { Job, Bid, WorkerProfile, JobCategory, JobStatus } from '../types';
import { INITIAL_JOBS, INITIAL_WORKERS } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'locallink_jobs_v1';
const WORKERS_STORAGE_KEY = 'locallink_workers_v1';

function getLocalJobs(): Job[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage read error:', e);
    return INITIAL_JOBS;
  }
}

function saveLocalJobs(jobs: Job[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

function getLocalWorkers(): WorkerProfile[] {
  try {
    const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(INITIAL_WORKERS));
      return INITIAL_WORKERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WORKERS;
  }
}

export const api = {
  async getJobs(filter?: { category?: string; status?: string; search?: string; customerId?: string }): Promise<Job[]> {
    try {
      const query = new URLSearchParams();
      if (filter?.category && filter.category !== 'All') query.set('category', filter.category);
      if (filter?.status && filter.status !== 'All') query.set('status', filter.status);
      if (filter?.search) query.set('search', filter.search);
      if (filter?.customerId) query.set('customerId', filter.customerId);

      const res = await fetch(`/api/jobs?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Job[] = await res.json();
      saveLocalJobs(data);
      return data;
    } catch {
      // Local fallback
      let jobs = getLocalJobs();
      if (filter?.category && filter.category !== 'All') {
        jobs = jobs.filter((j) => j.category === filter.category);
      }
      if (filter?.status && filter.status !== 'All') {
        jobs = jobs.filter((j) => j.status === filter.status);
      }
      if (filter?.customerId) {
        jobs = jobs.filter((j) => j.customerId === filter.customerId);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q) ||
            j.neighborhood.toLowerCase().includes(q)
        );
      }
      return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const jobs = getLocalJobs();
      return jobs.find((j) => j.id === id) || null;
    }
  },

  async createJob(payload: {
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
  }): Promise<Job> {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: Job = await res.json();
      const local = getLocalJobs();
      saveLocalJobs([created, ...local.filter((j) => j.id !== created.id)]);
      return created;
    } catch {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: payload.title.trim(),
        category: payload.category,
        description: payload.description.trim(),
        location: payload.location.trim(),
        neighborhood: payload.neighborhood || payload.location.split(',')[0].trim(),
        budget: Number(payload.budget),
        urgency: payload.urgency || 'This Week',
        status: 'Open',
        customerId: payload.customerId || 'cust-1',
        customerName: payload.customerName || 'Sarah Jenkins',
        customerPhone: payload.customerPhone || '(555) 234-8901',
        createdAt: new Date().toISOString(),
        bids: [],
      };
      const local = getLocalJobs();
      saveLocalJobs([newJob, ...local]);
      return newJob;
    }
  },

  async submitBid(
    jobId: string,
    payload: {
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
  ): Promise<{ job: Job; bid: Bid }> {
    try {
      const res = await fetch(`/api/jobs/${jobId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const local = getLocalJobs();
      saveLocalJobs(local.map((j) => (j.id === jobId ? data.job : j)));
      return data;
    } catch {
      const local = getLocalJobs();
      const jobIndex = local.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) throw new Error('Job not found');

      const newBid: Bid = {
        id: `bid-${Date.now()}`,
        jobId,
        workerId: payload.workerId,
        workerName: payload.workerName,
        workerAvatar: payload.workerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        tradeTitle: payload.tradeTitle,
        workerRating: payload.workerRating,
        completedJobsCount: payload.completedJobsCount,
        yearsExperience: payload.yearsExperience,
        proposedPrice: payload.proposedPrice,
        estimatedTime: payload.estimatedTime,
        message: payload.message,
        includesMaterials: payload.includesMaterials,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      const updatedJob = {
        ...local[jobIndex],
        bids: [...local[jobIndex].bids, newBid],
      };
      local[jobIndex] = updatedJob;
      saveLocalJobs(local);
      return { job: updatedJob, bid: newBid };
    }
  },

  async selectWorker(jobId: string, bidId: string): Promise<Job> {
    try {
      const res = await fetch(`/api/jobs/${jobId}/select-worker`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: Job = await res.json();
      const local = getLocalJobs();
      saveLocalJobs(local.map((j) => (j.id === jobId ? updated : j)));
      return updated;
    } catch {
      const local = getLocalJobs();
      const jobIndex = local.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) throw new Error('Job not found');

      const job = local[jobIndex];
      const selectedBid = job.bids.find((b) => b.id === bidId);
      if (!selectedBid) throw new Error('Bid not found');

      const updatedJob: Job = {
        ...job,
        status: 'Worker Selected',
        selectedBidId: bidId,
        selectedWorker: {
          workerId: selectedBid.workerId,
          workerName: selectedBid.workerName,
          tradeTitle: selectedBid.tradeTitle,
          agreedPrice: selectedBid.proposedPrice,
          selectedAt: new Date().toISOString(),
        },
        bids: job.bids.map((b) => ({
          ...b,
          status: b.id === bidId ? 'accepted' : 'rejected',
        })),
      };

      local[jobIndex] = updatedJob;
      saveLocalJobs(local);
      return updatedJob;
    }
  },

  async completeJob(jobId: string, rating?: number, comment?: string): Promise<Job> {
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: Job = await res.json();
      const local = getLocalJobs();
      saveLocalJobs(local.map((j) => (j.id === jobId ? updated : j)));
      return updated;
    } catch {
      const local = getLocalJobs();
      const jobIndex = local.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) throw new Error('Job not found');

      const job = local[jobIndex];
      const updatedJob: Job = {
        ...job,
        status: 'Completed',
        completedAt: new Date().toISOString(),
        review: rating
          ? {
              rating: Math.min(5, Math.max(1, rating)),
              comment: comment?.trim() || 'Service completed to full satisfaction.',
              reviewedAt: new Date().toISOString(),
            }
          : undefined,
      };

      local[jobIndex] = updatedJob;
      saveLocalJobs(local);
      return updatedJob;
    }
  },

  async getWorkers(): Promise<WorkerProfile[]> {
    try {
      const res = await fetch('/api/workers');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return getLocalWorkers();
    }
  },

  async resetData(): Promise<Job[]> {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      saveLocalJobs(data.jobs);
      return data.jobs;
    } catch {
      saveLocalJobs(INITIAL_JOBS);
      return INITIAL_JOBS;
    }
  },
};
