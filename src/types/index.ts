export type JobCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'Cleaning'
  | 'Carpentry'
  | 'Painting'
  | 'Appliance Repair'
  | 'Landscaping'
  | 'Handyman';

export type JobStatus = 'Open' | 'Worker Selected' | 'Completed';

export interface Bid {
  id: string;
  jobId: string;
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
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface JobReview {
  rating: number;
  comment: string;
  reviewedAt: string;
}

export interface Job {
  id: string;
  title: string;
  category: JobCategory;
  description: string;
  location: string;
  neighborhood: string;
  budget: number;
  urgency: 'Emergency / Today' | 'Within 48 Hours' | 'This Week' | 'Flexible';
  status: JobStatus;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;
  bids: Bid[];
  selectedBidId?: string;
  selectedWorker?: {
    workerId: string;
    workerName: string;
    tradeTitle: string;
    agreedPrice: number;
    selectedAt: string;
  };
  review?: JobReview;
  completedAt?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  tradeTitle: string;
  category: JobCategory;
  avatar: string;
  rating: number;
  reviewsCount: number;
  completedJobsCount: number;
  yearsExperience: number;
  bio: string;
  badge: string;
  hourlyBenchmark: number;
  phone: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  location: string;
  neighborhood: string;
  avatar: string;
  phone: string;
}
