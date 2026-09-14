import React from 'react';
import { SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
import { REGIONS } from '../data/regionsData';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Compass,
  Flag,
  Trees,
  Snowflake,
  Sun,
  Waves,
  Grid,
  Palmtree,
  Camera,
  MapPin,
} from 'lucide-react';

interface AchievementsViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  language?: 'he' | 'en';
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Flag: <Flag className="w-5 h-5 text-indigo-600" />,
  Compass: <Compass className="w-5 h-5 text-indigo-600" />,
  Trees: <Trees className="w-5 h-5 text-emerald-600" />,
  Snowflake: <Snowflake className="w-5 h-5 text-sky-500" />,
  Sun: <Sun className="w-5 h-5 text-amber-500" />,
  Grid: <Grid className="w-5 h-5 text-indigo-600" />,
  Waves: <Waves className="w-5 h-5 text-cyan-600" />,
  Palmtree: <Palmtree className="w-5 h-5 text-amber-600" />,
  Camera: <Camera className="w-5 h-5 text-violet-600" />,
  MapPin: <MapPin className="w-5 h-5 text-rose-500" />,
  Award: <Award className="w-5 h-5 text-amber-500" />,
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  Trophy: <Trophy className="w-5 h-5 text-amber-500" />,
};

const REGION_COLORS: Record<string, string> = {
  Northeast: '#6366f1',
  Midwest: '#10b981',
  South: '#ef4444',
  West: '#f59e0b',
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  spottedRecords,
  language = 'he',
}) => {
  const records = Object.values(spottedRecords) as SpottedRecord[];
  const foundCount = Object.keys(spottedRecords).filter((id) => STATES_DATA[id]).length;
  const remainingCount = 50 - foundCount;

  // Unlocked badges
  const unlockedBadges = ACHIEVEMENTS.filter((b) => b.checkUnlocked(spottedRecords));

  // First found & Latest found
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.spottedAt).getTime() - new Date(b.spottedAt).getTime()
  );
  const firstRecord = sortedRecords[0];
  const latestRecord = sortedRecords[sortedRecords.length - 1];

  const firstState = firstRecord ? STATES_DATA[firstRecord.stateId] : null;
  const latestState = latestRecord ? STATES_DATA[latestRecord.stateId] : null;

  // Regional breakdown
  const regionalCounts: Record<string, { found: number; total: number }> = {
    Northeast: { found: 0, total: 0 },
    Midwest: { found: 0, total: 0 },
    South: { found: 0, total: 0 },
    West: { found: 0, total: 0 },
  };

  Object.values(STATES_DATA).forEach((st) => {
    if (regionalCounts[st.region]) {
      regionalCounts[st.region].total++;
      if (spottedRecords[st.id]) {
        regionalCounts[st.region].found++;
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="pt-1">
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          🏆 {language === 'he' ? 'הישגים ואבני דרך' : 'Achievements'}
        </h1>
        <p className="text-sm text-slate-500">
          {language === 'he'
            ? 'מעקב אחר אבני הדרך והסטטיסטיקות שלכם'
            : 'Track your milestones and stats'}
        </p>
      </header>

      {/* 2x2 Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'he' ? 'מדינות שנמצאו' : 'States Found'}
          </div>
          <div className="text-xl font-black text-slate-800 mt-0.5">
            {foundCount}
            <span className="text-sm font-semibold text-slate-400">/50</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'he' ? 'נותרו לגילוי' : 'Remaining'}
          </div>
          <div className="text-xl font-black text-slate-800 mt-0.5">
            {remainingCount}
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'he' ? 'סה״כ תצפיות' : 'Total Sightings'}
          </div>
          <div className="text-xl font-black text-slate-800 mt-0.5">
            {records.length}
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {language === 'he' ? 'תגים שנפתחו' : 'Badges Earned'}
          </div>
          <div className="text-xl font-black text-slate-800 mt-0.5">
            {unlockedBadges.length}
            <span className="text-sm font-semibold text-slate-400">
              /{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {language === 'he' ? 'אבני דרך' : 'milestones'}
          </div>
        </div>
      </div>

      {/* First Found & Latest Found (2 columns) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span>{language === 'he' ? 'נמצאה ראשונה' : 'First found'}</span>
          </div>
          <div className="font-bold text-slate-800 mt-1 truncate text-sm">
            {firstState
              ? language === 'he'
                ? firstState.nameHe
                : firstState.name
              : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {firstRecord
              ? new Date(firstRecord.spottedAt).toLocaleDateString(
                  language === 'he' ? 'he-IL' : 'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )
              : '—'}
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{language === 'he' ? 'נמצאה אחרונה' : 'Latest found'}</span>
          </div>
          <div className="font-bold text-slate-800 mt-1 truncate text-sm">
            {latestState
              ? language === 'he'
                ? latestState.nameHe
                : latestState.name
              : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {latestRecord
              ? new Date(latestRecord.spottedAt).toLocaleDateString(
                  language === 'he' ? 'he-IL' : 'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )
              : '—'}
          </div>
        </div>
      </div>

      {/* States found by region */}
      <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {language === 'he' ? 'מדינות שנמצאו לפי אזור' : 'States found by region'}
        </div>

        {Object.entries(regionalCounts).map(([regionKey, data]) => {
          const regionDef = REGIONS[regionKey as keyof typeof REGIONS];
          const pct = data.total > 0 ? Math.round((data.found / data.total) * 100) : 0;
          const color = REGION_COLORS[regionKey] || '#6366f1';

          return (
            <div key={regionKey} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">
                  {language === 'he' ? regionDef?.nameHe || regionKey : regionKey}
                </span>
                <span className="text-slate-500">
                  {data.found}/{data.total} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges List */}
      <div className="space-y-2.5 pt-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {language === 'he' ? 'תגי הישג' : 'Milestone Badges'}
        </div>

        <div className="space-y-2">
          {ACHIEVEMENTS.map((badge) => {
            const unlocked = badge.checkUnlocked(spottedRecords);
            const { current, total } = badge.calculateProgress(spottedRecords);
            const pct = Math.round((current / total) * 100);

            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-3.5 flex items-center gap-3.5 transition-all ring-1 ${
                  unlocked
                    ? 'bg-white ring-indigo-100 shadow-2xs'
                    : 'bg-slate-50/80 ring-slate-200/60 opacity-70'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    unlocked
                      ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-400 grayscale'
                  }`}
                >
                  {ICON_MAP[badge.icon] || <Trophy className="w-5 h-5 text-amber-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-slate-800 text-sm truncate">
                      {language === 'he' ? badge.titleHe : badge.titleEn}
                    </h3>
                    {unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === 'he' ? 'נפתח' : 'Unlocked'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 shrink-0">
                        <Lock className="w-3 h-3" />
                        {current}/{total}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {language === 'he' ? badge.descriptionHe : badge.descriptionEn}
                  </p>

                  {!unlocked && (
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
