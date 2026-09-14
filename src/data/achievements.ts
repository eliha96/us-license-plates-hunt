import { Achievement, SpottedRecord } from '../types';
import { STATES_DATA } from './statesData';

// State adjacency graph for US contiguous path calculations
const US_STATE_NEIGHBORS: Record<string, string[]> = {
  WA: ['OR', 'ID'],
  OR: ['WA', 'ID', 'NV', 'CA'],
  CA: ['OR', 'NV', 'AZ'],
  ID: ['WA', 'OR', 'NV', 'UT', 'WY', 'MT'],
  NV: ['OR', 'CA', 'AZ', 'UT', 'ID'],
  AZ: ['CA', 'NV', 'UT', 'NM'],
  UT: ['ID', 'NV', 'AZ', 'CO', 'WY'],
  MT: ['ID', 'WY', 'SD', 'ND'],
  WY: ['MT', 'ID', 'UT', 'CO', 'NE', 'SD'],
  CO: ['WY', 'UT', 'NM', 'OK', 'KS', 'NE'],
  NM: ['AZ', 'UT', 'CO', 'OK', 'TX'],
  ND: ['MT', 'SD', 'MN'],
  SD: ['ND', 'MT', 'WY', 'NE', 'IA', 'MN'],
  NE: ['SD', 'WY', 'CO', 'KS', 'MO', 'IA'],
  KS: ['NE', 'CO', 'OK', 'MO'],
  OK: ['KS', 'CO', 'NM', 'TX', 'AR', 'MO'],
  TX: ['NM', 'OK', 'AR', 'LA'],
  MN: ['ND', 'SD', 'IA', 'WI'],
  IA: ['MN', 'SD', 'NE', 'KS', 'MO', 'IL', 'WI'],
  MO: ['IA', 'NE', 'KS', 'OK', 'AR', 'TN', 'KY', 'IL'],
  AR: ['MO', 'OK', 'TX', 'LA', 'MS', 'TN'],
  LA: ['AR', 'TX', 'MS'],
  WI: ['MN', 'IA', 'IL', 'MI'],
  IL: ['WI', 'IA', 'MO', 'KY', 'IN'],
  MI: ['WI', 'IN', 'OH'],
  IN: ['MI', 'IL', 'KY', 'OH'],
  KY: ['IL', 'MO', 'TN', 'VA', 'WV', 'OH', 'IN'],
  TN: ['KY', 'MO', 'AR', 'MS', 'AL', 'GA', 'NC', 'VA'],
  MS: ['TN', 'AR', 'LA', 'AL'],
  AL: ['TN', 'MS', 'FL', 'GA'],
  GA: ['NC', 'TN', 'AL', 'FL', 'SC'],
  FL: ['AL', 'GA'],
  SC: ['NC', 'GA'],
  NC: ['VA', 'TN', 'GA', 'SC'],
  VA: ['MD', 'WV', 'KY', 'TN', 'NC'],
  WV: ['OH', 'PA', 'MD', 'VA', 'KY'],
  OH: ['MI', 'IN', 'KY', 'WV', 'PA'],
  PA: ['NY', 'NJ', 'DE', 'MD', 'WV', 'OH'],
  NY: ['VT', 'MA', 'CT', 'NJ', 'PA'],
  NJ: ['NY', 'PA', 'DE'],
  DE: ['MD', 'PA', 'NJ'],
  MD: ['PA', 'DE', 'VA', 'WV'],
  VT: ['NY', 'NH', 'MA'],
  NH: ['ME', 'VT', 'MA'],
  ME: ['NH'],
  MA: ['VT', 'NH', 'RI', 'CT', 'NY'],
  RI: ['MA', 'CT'],
  CT: ['NY', 'MA', 'RI'],
};

// Check contiguous BFS path from Pacific (WA/OR/CA) to Atlantic Coast
const checkContiguousCoastToCoast = (spotted: Record<string, SpottedRecord>): boolean => {
  const pacificStarts = ['WA', 'OR', 'CA'].filter((id) => Boolean(spotted[id]));
  const atlanticTargets = new Set([
    'ME', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'DE', 'MD', 'VA', 'NC', 'SC', 'GA', 'FL'
  ]);

  if (pacificStarts.length === 0) return false;

  const queue = [...pacificStarts];
  const visited = new Set(pacificStarts);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (atlanticTargets.has(current)) {
      return true;
    }

    const neighbors = US_STATE_NEIGHBORS[current] || [];
    for (const neighbor of neighbors) {
      if (Boolean(spotted[neighbor]) && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
};

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
    titleHe: 'מחוף לחוף (רצף גאוגרפי)',
    titleEn: 'Coast to Coast Chain',
    descriptionHe: 'יצרת רצף גאוגרפי רציף של מדינות שנמצאו המקשר בין האוקיינוס השקט לאוקיינוס האטלנטי!',
    descriptionEn: 'Formed a continuous geographical chain of spotted states from the Pacific to the Atlantic!',
    icon: 'Compass',
    category: 'milestone',
    checkUnlocked: (spotted) => checkContiguousCoastToCoast(spotted),
    calculateProgress: (spotted) => {
      const isUnlocked = checkContiguousCoastToCoast(spotted);
      return { current: isUnlocked ? 1 : 0, total: 1 };
    },
  },
  {
    id: 'new_england',
    titleHe: 'ניו אינגלנד המלאה',
    titleEn: 'New England Explorer',
    descriptionHe: 'מצאת את כל 6 מדינות ניו אינגלנד (מיין, ניו המפשייר, ורמונט, מסצ׳וסטס, רוד איילנד, קונטיקט)!',
    descriptionEn: 'Spotted all 6 New England states (ME, NH, VT, MA, RI, CT)!',
    icon: 'Trees',
    category: 'region',
    checkUnlocked: (spotted) => {
      const ne = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'];
      return ne.every((id) => Boolean(spotted[id]));
    },
    calculateProgress: (spotted) => {
      const ne = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'];
      const count = ne.filter((id) => Boolean(spotted[id])).length;
      return { current: count, total: 6 };
    },
  },
  {
    id: 'canada_border',
    titleHe: 'גבול הצפון (קנדה)',
    titleEn: 'Northern Border Trail',
    descriptionHe: 'מצאת לפחות 6 מדינות בארה״ב שגובלות בקנדה (מתוך AK, WA, ID, MT, ND, MN, WI, MI, NY, VT, NH, ME)!',
    descriptionEn: 'Spotted at least 6 US states bordering Canada!',
    icon: 'Snowflake',
    category: 'region',
    checkUnlocked: (spotted) => {
      const borderStates = ['AK', 'WA', 'ID', 'MT', 'ND', 'MN', 'WI', 'MI', 'NY', 'VT', 'NH', 'ME'];
      const count = borderStates.filter((id) => Boolean(spotted[id])).length;
      return count >= 6;
    },
    calculateProgress: (spotted) => {
      const borderStates = ['AK', 'WA', 'ID', 'MT', 'ND', 'MN', 'WI', 'MI', 'NY', 'VT', 'NH', 'ME'];
      const count = borderStates.filter((id) => Boolean(spotted[id])).length;
      return { current: Math.min(count, 6), total: 6 };
    },
  },
  {
    id: 'mexico_border',
    titleHe: 'גבול הדרום (מקסיקו)',
    titleEn: 'Southern Border Patrol',
    descriptionHe: 'מצאת את כל 4 המדינות בארה״ב שגובלות במקסיקו (קליפורניה, אריזונה, ניו מקסיקו, טקסס)!',
    descriptionEn: 'Spotted all 4 US states bordering Mexico (CA, AZ, NM, TX)!',
    icon: 'Sun',
    category: 'region',
    checkUnlocked: (spotted) => {
      const borderStates = ['CA', 'AZ', 'NM', 'TX'];
      return borderStates.every((id) => Boolean(spotted[id]));
    },
    calculateProgress: (spotted) => {
      const borderStates = ['CA', 'AZ', 'NM', 'TX'];
      const count = borderStates.filter((id) => Boolean(spotted[id])).length;
      return { current: count, total: 4 };
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
      const main50 = Object.keys(STATES_DATA);
      return main50.every((id) => Boolean(spotted[id]));
    },
    calculateProgress: (spotted) => {
      const main50 = Object.keys(STATES_DATA);
      const count = main50.filter((id) => Boolean(spotted[id])).length;
      return { current: count, total: 50 };
    },
  },
];
