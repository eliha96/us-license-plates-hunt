import { Achievement, SpottedRecord } from '../types';
import { STATES_DATA } from './statesData';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_plate',
    titleHe: 'הצעד הראשון',
    titleEn: 'First Mile',
    descriptionHe: 'תיעדת את לוחית הרישוי הראשונה במסע!',
    descriptionEn: 'Logged your very first license plate on the trip!',
    icon: 'Flag',
    category: 'starter',
    checkUnlocked: (spotted) => Object.keys(spotted).length >= 1,
    calculateProgress: (spotted) => ({
      current: Math.min(Object.keys(spotted).length, 1),
      total: 1,
    }),
  },
  {
    id: 'coast_to_coast',
    titleHe: 'מחוף לחוף',
    titleEn: 'Coast to Coast',
    descriptionHe: 'מצאת לפחות מדינה אחת מחוף האוקיינוס השקט ולפחות אחת מחוף האוקיינוס האטלנטי!',
    descriptionEn: 'Spotted at least one Pacific Coast and one Atlantic Coast state!',
    icon: 'Compass',
    category: 'milestone',
    checkUnlocked: (spotted) => {
      const ids = Object.keys(spotted);
      const hasPacific = ids.some((id) => STATES_DATA[id]?.isCoastPacific);
      const hasAtlantic = ids.some((id) => STATES_DATA[id]?.isCoastAtlantic);
      return hasPacific && hasAtlantic;
    },
    calculateProgress: (spotted) => {
      const ids = Object.keys(spotted);
      const hasPacific = ids.some((id) => STATES_DATA[id]?.isCoastPacific) ? 1 : 0;
      const hasAtlantic = ids.some((id) => STATES_DATA[id]?.isCoastAtlantic) ? 1 : 0;
      return { current: hasPacific + hasAtlantic, total: 2 };
    },
  },
  {
    id: 'all_regions',
    titleHe: 'אחד מכל אזור',
    titleEn: 'Four Corners',
    descriptionHe: 'מצאת לפחות מדינה אחת מכל אחד מארבעת האזורים המרכזיים (מערב, דרום, מערב תיכון, צפון-מזרח)!',
    descriptionEn: 'Spotted at least one state from every major region (West, South, Midwest, Northeast)!',
    icon: 'Grid',
    category: 'region',
    checkUnlocked: (spotted) => {
      const spottedList = Object.keys(spotted).map((id) => STATES_DATA[id]).filter(Boolean);
      const regions = new Set(spottedList.map((s) => s.region));
      return (
        regions.has('West') &&
        regions.has('South') &&
        regions.has('Midwest') &&
        regions.has('Northeast')
      );
    },
    calculateProgress: (spotted) => {
      const spottedList = Object.keys(spotted).map((id) => STATES_DATA[id]).filter(Boolean);
      const regions = new Set(spottedList.map((s) => s.region));
      const required = ['West', 'South', 'Midwest', 'Northeast'];
      const count = required.filter((r) => regions.has(r as any)).length;
      return { current: count, total: 4 };
    },
  },
  {
    id: 'pacific_trio',
    titleHe: 'שלישיית החוף המערבי',
    titleEn: 'Pacific Coastline',
    descriptionHe: 'מצאת את כל 3 מדינות החוף המערבי: קליפורניה, אורגון ו-וושינגטון!',
    descriptionEn: 'Spotted all 3 Pacific mainland states: California, Oregon, and Washington!',
    icon: 'Waves',
    category: 'region',
    checkUnlocked: (spotted) => {
      return Boolean(spotted['CA'] && spotted['OR'] && spotted['WA']);
    },
    calculateProgress: (spotted) => {
      const pacific = ['CA', 'OR', 'WA'];
      const count = pacific.filter((id) => Boolean(spotted[id])).length;
      return { current: count, total: 3 };
    },
  },
  {
    id: 'wild_west',
    titleHe: 'המערב הפרוע',
    titleEn: 'Wild West',
    descriptionHe: 'מצאת 4 מדינות דרום-מערביות (טקסס, אריזונה, ניו מקסיקו, נבדה, יוטה, קולורדו)!',
    descriptionEn: 'Spotted 4 Southwestern/Mountain states (TX, AZ, NM, NV, UT, CO)!',
    icon: 'Sun',
    category: 'region',
    checkUnlocked: (spotted) => {
      const sw = ['TX', 'AZ', 'NM', 'NV', 'UT', 'CO'];
      const count = sw.filter((id) => Boolean(spotted[id])).length;
      return count >= 4;
    },
    calculateProgress: (spotted) => {
      const sw = ['TX', 'AZ', 'NM', 'NV', 'UT', 'CO'];
      const count = sw.filter((id) => Boolean(spotted[id])).length;
      return { current: Math.min(count, 4), total: 4 };
    },
  },
  {
    id: 'heartland',
    titleHe: 'הלב של אמריקה',
    titleEn: 'Heartland Explorer',
    descriptionHe: 'מצאת 5 מדינות מאזור המערב התיכון (Midwest)!',
    descriptionEn: 'Spotted 5 states from the Midwest region!',
    icon: 'Trees',
    category: 'region',
    checkUnlocked: (spotted) => {
      const midwestCount = Object.keys(spotted).filter(
        (id) => STATES_DATA[id]?.region === 'Midwest'
      ).length;
      return midwestCount >= 5;
    },
    calculateProgress: (spotted) => {
      const midwestCount = Object.keys(spotted).filter(
        (id) => STATES_DATA[id]?.region === 'Midwest'
      ).length;
      return { current: Math.min(midwestCount, 5), total: 5 };
    },
  },
  {
    id: 'far_flung',
    titleHe: 'הספר הרחוק',
    titleEn: 'Far Flung Frontiers',
    descriptionHe: 'מצאת לוחית מחוץ ליבשת: אלסקה או הוואי!',
    descriptionEn: 'Spotted a non-contiguous plate: Alaska or Hawaii!',
    icon: 'Palmtree',
    category: 'milestone',
    checkUnlocked: (spotted) => Boolean(spotted['AK'] || spotted['HI']),
    calculateProgress: (spotted) => {
      const count = (spotted['AK'] ? 1 : 0) + (spotted['HI'] ? 1 : 0);
      return { current: Math.min(count, 1), total: 1 };
    },
  },
  {
    id: 'photo_collector',
    titleHe: 'צלם דרכים',
    titleEn: 'Road Photographer',
    descriptionHe: 'תיעדת 5 לוחיות רישוי עם תמונה אמיתית!',
    descriptionEn: 'Snapped photos for at least 5 different license plates!',
    icon: 'Camera',
    category: 'explorer',
    checkUnlocked: (spotted) => {
      const photoCount = Object.values(spotted).filter((s) => Boolean(s.photoUrl)).length;
      return photoCount >= 5;
    },
    calculateProgress: (spotted) => {
      const photoCount = Object.values(spotted).filter((s) => Boolean(s.photoUrl)).length;
      return { current: Math.min(photoCount, 5), total: 5 };
    },
  },
  {
    id: 'location_chronicler',
    titleHe: 'יומן מסע מפורט',
    titleEn: 'Road Chronicler',
    descriptionHe: 'רשמת מיקום מדויק עבור 8 לוחיות שונות לפחות!',
    descriptionEn: 'Logged specific locations for at least 8 plates!',
    icon: 'MapPin',
    category: 'explorer',
    checkUnlocked: (spotted) => {
      const locCount = Object.values(spotted).filter((s) => Boolean(s.location?.trim())).length;
      return locCount >= 8;
    },
    calculateProgress: (spotted) => {
      const locCount = Object.values(spotted).filter((s) => Boolean(s.location?.trim())).length;
      return { current: Math.min(locCount, 8), total: 8 };
    },
  },
  {
    id: 'quarter_way',
    titleHe: 'רבע הדרך',
    titleEn: 'Quarter Century (12 States)',
    descriptionHe: 'מצאת 12 מדינות שונות (רבע מכל ארה״ב)!',
    descriptionEn: 'Spotted 12 different states (25% milestone)!',
    icon: 'Award',
    category: 'milestone',
    checkUnlocked: (spotted) => Object.keys(spotted).length >= 12,
    calculateProgress: (spotted) => ({
      current: Math.min(Object.keys(spotted).length, 12),
      total: 12,
    }),
  },
  {
    id: 'half_way',
    titleHe: 'חצי הדרך!',
    titleEn: 'Halfway Mark (25 States)',
    descriptionHe: 'מצאת 25 מדינות - חצי מכל 50 מדינות ארה״ב!',
    descriptionEn: 'Spotted 25 states - half of the entire nation!',
    icon: 'Sparkles',
    category: 'milestone',
    checkUnlocked: (spotted) => Object.keys(spotted).length >= 25,
    calculateProgress: (spotted) => ({
      current: Math.min(Object.keys(spotted).length, 25),
      total: 25,
    }),
  },
  {
    id: 'grand_slam',
    titleHe: 'אגדת הרוד-טריפ (50/50)',
    titleEn: 'Grand Slam 50/50',
    descriptionHe: 'השלמת את האתגר הגדול: כל 50 המדינות של ארצות הברית!',
    descriptionEn: 'The Ultimate Road Trip Triumph: All 50 United States completed!',
    icon: 'Trophy',
    category: 'milestone',
    checkUnlocked: (spotted) => {
      const main50 = Object.keys(STATES_DATA).filter((id) => id !== 'DC');
      return main50.every((id) => Boolean(spotted[id]));
    },
    calculateProgress: (spotted) => {
      const main50 = Object.keys(STATES_DATA).filter((id) => id !== 'DC');
      const count = main50.filter((id) => Boolean(spotted[id])).length;
      return { current: count, total: 50 };
    },
  },
];
