import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_JOBS, INITIAL_WORKERS, INITIAL_CUSTOMERS } from './src/data/seedData';
import { Job, Bid } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure database file exists
function getDatabase(): { jobs: Job[]; workers: typeof INITIAL_WORKERS; customers: typeof INITIAL_CUSTOMERS } {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        jobs: INITIAL_JOBS,
        workers: INITIAL_WORKERS,
        customers: INITIAL_CUSTOMERS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, using in-memory seed:', err);
    return {
      jobs: INITIAL_JOBS,
      workers: INITIAL_WORKERS,
      customers: INITIAL_CUSTOMERS,
    };
  }
}

function saveDatabase(data: { jobs: Job[]; workers: typeof INITIAL_WORKERS; customers: typeof INITIAL_CUSTOMERS }) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB
  getDatabase();

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all jobs with optional filters
  app.get('/api/jobs', (req, res) => {
    const db = getDatabase();
    let jobs = [...db.jobs];
    const { category, status, search, customerId } = req.query;

    if (category && category !== 'All') {
      jobs = jobs.filter((j) => j.category === category);
    }
    if (status && status !== 'All') {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (customerId) {
      jobs = jobs.filter((j) => j.customerId === customerId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.neighborhood.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(jobs);
  });

  // Get single job
  app.get('/api/jobs/:id', (req, res) => {
    const db = getDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  });

  // Post new job
  app.post('/api/jobs', (req, res) => {
    const { title, category, description, location, neighborhood, budget, urgency, customerId, customerName, customerPhone } = req.body;

    if (!title || !category || !description || !location || !budget) {
      res.status(400).json({ error: 'Missing required job fields' });
      return;
    }

    const db = getDatabase();
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      neighborhood: neighborhood ? neighborhood.trim() : location.split(',')[0].trim(),
      budget: Number(budget),
      urgency: urgency || 'This Week',
      status: 'Open',
      customerId: customerId || 'cust-1',
      customerName: customerName || 'Sarah Jenkins',
      customerPhone: customerPhone || '(555) 234-8901',
      createdAt: new Date().toISOString(),
      bids: [],
    };

    db.jobs.unshift(newJob);
    saveDatabase(db);
    res.status(201).json(newJob);
  });

  // Submit a bid on a job
  app.post('/api/jobs/:id/bids', (req, res) => {
    const { id } = req.params;
    const { workerId, workerName, workerAvatar, tradeTitle, workerRating, completedJobsCount, yearsExperience, proposedPrice, estimatedTime, message, includesMaterials } = req.body;

    if (!workerName || !proposedPrice || !message) {
      res.status(400).json({ error: 'Missing required bid fields (workerName, proposedPrice, message)' });
      return;
    }

    const db = getDatabase();
    const jobIndex = db.jobs.findIndex((j) => j.id === id);
    if (jobIndex === -1) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = db.jobs[jobIndex];
    if (job.status !== 'Open') {
      res.status(400).json({ error: 'This job is no longer accepting bids' });
      return;
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      jobId: id,
      workerId: workerId || `worker-${Date.now()}`,
      workerName: workerName.trim(),
      workerAvatar: workerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      tradeTitle: tradeTitle || 'Local Service Pro',
      workerRating: Number(workerRating) || 5.0,
      completedJobsCount: Number(completedJobsCount) || 12,
      yearsExperience: Number(yearsExperience) || 5,
      proposedPrice: Number(proposedPrice),
      estimatedTime: estimatedTime || 'Within 2 days',
      message: message.trim(),
      includesMaterials: Boolean(includesMaterials),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    job.bids.push(newBid);
    db.jobs[jobIndex] = job;
    saveDatabase(db);
    res.status(201).json({ job, bid: newBid });
  });

  // Select a worker (Award Job)
  app.patch('/api/jobs/:id/select-worker', (req, res) => {
    const { id } = req.params;
    const { bidId } = req.body;

    if (!bidId) {
      res.status(400).json({ error: 'bidId is required' });
      return;
    }

    const db = getDatabase();
    const jobIndex = db.jobs.findIndex((j) => j.id === id);
    if (jobIndex === -1) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = db.jobs[jobIndex];
    const selectedBid = job.bids.find((b) => b.id === bidId);
    if (!selectedBid) {
      res.status(404).json({ error: 'Bid not found for this job' });
      return;
    }

    job.status = 'Worker Selected';
    job.selectedBidId = bidId;
    job.selectedWorker = {
      workerId: selectedBid.workerId,
      workerName: selectedBid.workerName,
      tradeTitle: selectedBid.tradeTitle,
      agreedPrice: selectedBid.proposedPrice,
      selectedAt: new Date().toISOString(),
    };

    // Update statuses of bids
    job.bids = job.bids.map((b) => ({
      ...b,
      status: b.id === bidId ? 'accepted' : 'rejected',
    }));

    db.jobs[jobIndex] = job;
    saveDatabase(db);
    res.json(job);
  });

  // Mark job as completed
  app.patch('/api/jobs/:id/complete', (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const db = getDatabase();
    const jobIndex = db.jobs.findIndex((j) => j.id === id);
    if (jobIndex === -1) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = db.jobs[jobIndex];
    job.status = 'Completed';
    job.completedAt = new Date().toISOString();

    if (rating) {
      job.review = {
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: comment ? comment.trim() : 'Service completed to satisfaction.',
        reviewedAt: new Date().toISOString(),
      };
    }

    db.jobs[jobIndex] = job;
    saveDatabase(db);
    res.json(job);
  });

  // Reset database back to initial seed
  app.post('/api/reset', (_req, res) => {
    const resetData = {
      jobs: INITIAL_JOBS,
      workers: INITIAL_WORKERS,
      customers: INITIAL_CUSTOMERS,
    };
    saveDatabase(resetData);
    res.json({ message: 'Database reset to initial seed data', jobs: INITIAL_JOBS });
  });

  // Get workers list
  app.get('/api/workers', (_req, res) => {
    const db = getDatabase();
    res.json(db.workers);
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`LocalLink server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
