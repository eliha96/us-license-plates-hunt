import { SpottedRecord, TripSettings } from '../types';

const STORAGE_KEY = 'us_plate_game_spotted_v1';
const SETTINGS_KEY = 'us_plate_game_settings_v1';

export const DEFAULT_SETTINGS: TripSettings = {
  tripName: 'המסע הגדול בארה״ב 2026',
  startDate: new Date().toISOString().split('T')[0],
  soundEnabled: true,
  language: 'he',
};

export function loadSpottedFromStorage(): Record<string, SpottedRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load records from storage', err);
    return {};
  }
}

export function saveSpottedToStorage(records: Record<string, SpottedRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to storage', err);
  }
}

export function loadSettingsFromStorage(): TripSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: TripSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function getRankDetails(count: number, lang: 'he' | 'en' = 'he') {
  if (count >= 50) {
    return {
      title: lang === 'he' ? 'אגדת כבישי ארה״ב' : 'Grand Slam Legend',
      level: 7,
      color: 'from-amber-500 to-yellow-300',
      badge: '👑',
      nextThreshold: 50,
    };
  }
  if (count >= 40) {
    return {
      title: lang === 'he' ? 'אלוף האוטוסטרדות' : 'Interstate Master',
      level: 6,
      color: 'from-purple-500 to-indigo-600',
      badge: '⭐',
      nextThreshold: 50,
    };
  }
  if (count >= 25) {
    return {
      title: lang === 'he' ? 'סייר חצי-היבשת' : 'Halfway Explorer',
      level: 5,
      color: 'from-blue-600 to-cyan-500',
      badge: '🧭',
      nextThreshold: 40,
    };
  }
  if (count >= 15) {
    return {
      title: lang === 'he' ? 'חוקר כביש 66' : 'Route 66 Scout',
      level: 4,
      color: 'from-emerald-600 to-teal-500',
      badge: '🚙',
      nextThreshold: 25,
    };
  }
  if (count >= 8) {
    return {
      title: lang === 'he' ? 'שוטט כבישים נלהב' : 'Highway Cruiser',
      level: 3,
      color: 'from-orange-500 to-amber-500',
      badge: '🛣️',
      nextThreshold: 15,
    };
  }
  if (count >= 1) {
    return {
      title: lang === 'he' ? 'נוסע מתחיל' : 'Rookie Spotter',
      level: 2,
      color: 'from-emerald-500 to-green-400',
      badge: '🚗',
      nextThreshold: 8,
    };
  }
  return {
    title: lang === 'he' ? 'בקו הזינוק' : 'At the Starting Line',
    level: 1,
    color: 'from-stone-400 to-stone-500',
    badge: '🏁',
    nextThreshold: 1,
  };
}

export function exportTripData(records: Record<string, SpottedRecord>, settings: TripSettings) {
  const data = {
    settings,
    records,
    exportedAt: new Date().toISOString(),
    totalSpotted: Object.keys(records).length,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `us-road-trip-plates-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
