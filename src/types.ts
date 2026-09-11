export type Region = 'West' | 'Midwest' | 'South' | 'Northeast';

export interface StateInfo {
  id: string; // 2 letter postal code, e.g. "CA", "NY"
  name: string;
  nameHe: string;
  capital: string;
  capitalHe: string;
  slogan: string;
  sloganHe: string;
  region: Region;
  regionHe: string;
  lat: number;
  lng: number;
  isCoastPacific?: boolean;
  isCoastAtlantic?: boolean;
  isSouthwest?: boolean;
  plateDesign?: {
    bg: string;
    text: string;
    border: string;
    accent: string;
    badgeColor: string;
  };
  samplePlateNumber?: string;
  triviaHe: string;
  triviaEn?: string;
  country?: 'US' | 'Canada' | 'Mexico';
  isBonus?: boolean;
}

export interface SpottedRecord {
  stateId: string;
  spottedAt: string; // ISO date string
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  photoUrl?: string; // base64 or object URL
}

export interface Achievement {
  id: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  icon: string;
  category: 'starter' | 'region' | 'milestone' | 'explorer';
  checkUnlocked: (spotted: Record<string, SpottedRecord>) => boolean;
  calculateProgress: (spotted: Record<string, SpottedRecord>) => { current: number; total: number };
}

export interface TripSettings {
  tripName: string;
  startDate: string;
  soundEnabled: boolean;
  language: 'he' | 'en';
}
