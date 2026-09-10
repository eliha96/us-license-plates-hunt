import { Region } from '../types';

export interface RegionDefinition {
  id: Region;
  nameEn: string;
  nameHe: string;
  descriptionHe: string;
  color: string; // Base vibrant hex
  lightColor: string; // Light tint for unspotted fill
  spottedColor: string; // Saturated fill for spotted
  borderColor: string; // Crisp border color
  badgeBg: string; // Tailwind class
  badgeText: string; // Tailwind class
  badgeBorder: string; // Tailwind class
  dotColorClass: string;
  stateIds: string[];
}

export const US_REGIONS: Record<Region, RegionDefinition> = {
  West: {
    id: 'West',
    nameEn: 'West',
    nameHe: 'מערב',
    descriptionHe: 'החוף הפסיפי, הרי הרוקי ומדבריות הדרום-מערב (כולל אלסקה והוואי)',
    color: '#F59E0B', // Amber
    lightColor: '#FEF3C7',
    spottedColor: '#F59E0B',
    borderColor: '#D97706',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    dotColorClass: 'bg-amber-500',
    stateIds: ['WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM', 'AK', 'HI'],
  },
  Midwest: {
    id: 'Midwest',
    nameEn: 'Midwest',
    nameHe: 'המערב התיכון',
    descriptionHe: 'לב אמריקה, המישורים הגדולים ואזור האגמים הגדולים',
    color: '#10B981', // Emerald
    lightColor: '#D1FAE5',
    spottedColor: '#10B981',
    borderColor: '#059669',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    dotColorClass: 'bg-emerald-500',
    stateIds: ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH'],
  },
  South: {
    id: 'South',
    nameEn: 'South',
    nameHe: 'דרום',
    descriptionHe: 'מדינות הדרום, חוף המפרץ, חצי האי פלורידה וטקסס',
    color: '#F43F5E', // Rose / Coral
    lightColor: '#FFE4E6',
    spottedColor: '#F43F5E',
    borderColor: '#E11D48',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-800 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    dotColorClass: 'bg-rose-500',
    stateIds: ['TX', 'OK', 'AR', 'LA', 'MS', 'TN', 'KY', 'AL', 'GA', 'FL', 'SC', 'NC', 'VA', 'WV', 'MD', 'DE', 'DC'],
  },
  Northeast: {
    id: 'Northeast',
    nameEn: 'Northeast',
    nameHe: 'צפון-מזרח',
    descriptionHe: 'ניו אינגלנד, מדינות החוף האטלנטי הצפוני והמרכזים ההיסטוריים',
    color: '#6366F1', // Indigo / Royal Blue
    lightColor: '#E0E7FF',
    spottedColor: '#6366F1',
    borderColor: '#4F46E5',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    dotColorClass: 'bg-indigo-500',
    stateIds: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
  },
};

export const REGION_ORDER: Region[] = ['West', 'Midwest', 'South', 'Northeast'];

export const REGIONS = US_REGIONS;

export function getRegionForState(stateId: string): Region {
  for (const [region, def] of Object.entries(US_REGIONS)) {
    if (def.stateIds.includes(stateId)) {
      return region as Region;
    }
  }
  return 'South';
}

export function getRegionColor(region: Region, isSpotted = false): { fill: string; stroke: string; opacity: number } {
  const config = US_REGIONS[region] || US_REGIONS.West;
  if (isSpotted) {
    return {
      fill: config.spottedColor,
      stroke: '#0F172A',
      opacity: 0.85,
    };
  }
  return {
    fill: config.color,
    stroke: config.borderColor,
    opacity: 0.35,
  };
}
