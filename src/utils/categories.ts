import { JobCategory } from '../types';
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Tv,
  Trees,
  SlidersHorizontal,
} from 'lucide-react';

export interface CategoryMeta {
  name: JobCategory;
  icon: typeof Wrench;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Plumbing',
    icon: Wrench,
    description: 'Pipes, drains, leaks, toilets, water heaters',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    borderColor: 'border-sky-200',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    name: 'Electrical',
    icon: Zap,
    description: 'Wiring, fixtures, outlets, breakers, lighting',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    name: 'Cleaning',
    icon: Sparkles,
    description: 'Deep clean, move-out, windows, sanitizing',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    name: 'Carpentry',
    icon: Hammer,
    description: 'Shelving, framing, doors, decks, custom trim',
    badgeBg: 'bg-amber-900/10',
    badgeText: 'text-amber-900',
    borderColor: 'border-amber-900/20',
    iconBg: 'bg-amber-900/15',
    iconColor: 'text-amber-900',
  },
  {
    name: 'Painting',
    icon: Paintbrush,
    description: 'Interior, exterior, drywall patch, accent walls',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Appliance Repair',
    icon: Tv,
    description: 'Refrigerators, washers, ovens, dishwashers',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    name: 'Landscaping',
    icon: Trees,
    description: 'Lawn care, tree trimming, garden beds, patio cleaning',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    borderColor: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    name: 'Handyman',
    icon: SlidersHorizontal,
    description: 'General repairs, TV mounting, furniture assembly',
    badgeBg: 'bg-zinc-100',
    badgeText: 'text-zinc-800',
    borderColor: 'border-zinc-300',
    iconBg: 'bg-zinc-200',
    iconColor: 'text-zinc-700',
  },
];

export function getCategoryMeta(categoryName: string): CategoryMeta {
  const found = CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return (
    found || {
      name: 'Handyman' as JobCategory,
      icon: Wrench,
      description: 'General services',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-800',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-200',
      iconColor: 'text-slate-700',
    }
  );
}
