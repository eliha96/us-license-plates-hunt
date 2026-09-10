import React, { useState } from 'react';
import { StateInfo, SpottedRecord, TripSettings } from '../types';
import { STATES_DATA } from '../data/statesData';
import { US_REGIONS, REGION_ORDER } from '../data/regionsData';
import { getRankDetails, exportTripData } from '../utils/storage';
import {
  Trophy,
  Camera,
  MapPin,
  Calendar,
  Share2,
  Download,
  CheckCircle2,
  Car,
  Compass,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface StatsDashboardProps {
  spottedRecords: Record<string, SpottedRecord>;
  settings: TripSettings;
  onSelectState: (state: StateInfo) => void;
  language?: 'he' | 'en';
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  spottedRecords,
  settings,
  onSelectState,
  language = 'he',
}) => {
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const spottedList: SpottedRecord[] = Object.values(spottedRecords);
  const spottedCount = spottedList.length;
  const totalCount = 50;
  const percentComplete = Math.round((spottedCount / totalCount) * 100);

  const photoCount = spottedList.filter((s) => Boolean(s.photoUrl)).length;
  const locationCount = spottedList.filter((s) => Boolean(s.location?.trim())).length;

  const lang: 'he' | 'en' = language === 'en' ? 'en' : 'he';
  const rank = getRankDetails(spottedCount, lang);

  // 4 Regions breakdown
  const regionStats = REGION_ORDER.map((regionKey) => {
    const regMeta = US_REGIONS[regionKey];
    const statesInRegion = Object.values(STATES_DATA).filter((s) => s.region === regionKey);
    const spottedInRegion = statesInRegion.filter((s) => Boolean(spottedRecords[s.id]));
    return {
      region: regionKey,
      nameHe: regMeta.nameHe,
      nameEn: regMeta.nameEn,
      color: regMeta.color,
      total: statesInRegion.length,
      spotted: spottedInRegion.length,
      percent: Math.round((spottedInRegion.length / statesInRegion.length) * 100),
    };
  });

  // Recent sightings
  const recentSightings: SpottedRecord[] = [...spottedList]
    .sort((a, b) => new Date(b.spottedAt).getTime() - new Date(a.spottedAt).getTime())
    .slice(0, 5);

  const generateShareText = () => {
    const statesNames = Object.keys(spottedRecords)
      .slice(0, 10)
      .map((id) => STATES_DATA[id]?.nameHe || id)
      .join(', ');
    const more = Object.keys(spottedRecords).length > 10 ? ' ועוד...' : '';

    if (language === 'he') {
      return `🚗 עדכון ממסע הכבישים בארה״ב (${settings.tripName})!
🎯 תפסנו ${spottedCount}/50 לוחיות רישוי (${percentComplete}%)
📸 ${photoCount} לוחיות תועדו בתמונות
🏆 דירוג נוכחי: ${rank.title} (${rank.badge})
📍 מדינות שראינו: ${statesNames}${more}
מתקדמים אל עבר היעד הגדול! 🇺🇸`;
    }

    return `🚗 US Road Trip License Plate Challenge!
🎯 Spotted ${spottedCount}/50 states (${percentComplete}%)
📸 ${photoCount} plates captured on photo
🏆 Current rank: ${rank.title} ${rank.badge}
On the road to all 50 states! 🇺🇸`;
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div id="stats-dashboard-container" className="space-y-4">
      {/* Top Hero Card */}
      <div
        id="stats-hero-card"
        className="bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-3xl shadow-inner">
              {rank.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {language === 'he' ? `רמה ${rank.level}` : `Level ${rank.level}`}
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-xs text-stone-300 font-medium">
                  {language === 'he' ? settings.tripName : 'US Road Trip'}
                </span>
              </div>
              <h2 id="stats-rank-title" className="text-xl sm:text-2xl font-black text-white">
                {rank.title}
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                {language === 'he'
                  ? `נמצאו ${spottedCount} מתוך 50 מדינות (${totalCount - spottedCount} נותרו)`
                  : `${spottedCount} of 50 states spotted (${totalCount - spottedCount} remaining)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              id="btn-open-share-modal"
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              {language === 'he' ? 'שתף גלוית מסע' : 'Share Card'}
            </button>
            <button
              id="btn-export-trip-json"
              type="button"
              onClick={() => exportTripData(spottedRecords, settings)}
              className="px-3 py-2 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5"
              title={language === 'he' ? 'ייצוא גיבוי נתונים' : 'Export JSON Backup'}
            >
              <Download className="w-4 h-4" />
              {language === 'he' ? 'גיבוי' : 'Backup'}
            </button>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-5 pt-4 border-t border-stone-800">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-stone-300">
              {language === 'he' ? 'התקדמות במסע המדינות' : 'Trip Journey Progress'}
            </span>
            <span className="text-emerald-400 font-extrabold">{percentComplete}%</span>
          </div>
          <div className="w-full bg-stone-800 rounded-full h-3.5 p-0.5 border border-stone-700">
            <div
              className="bg-linear-to-r from-emerald-500 to-teal-400 rounded-full h-full transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Car className="w-4 h-4" />
            <span className="text-xs font-bold text-stone-600">
              {language === 'he' ? 'לוחיות שנמצאו' : 'Plates Spotted'}
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {spottedCount}
            <span className="text-xs text-stone-600 font-normal mr-1">/ 50</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Compass className="w-4 h-4" />
            <span className="text-xs font-bold text-stone-600">
              {language === 'he' ? 'מדינות שנותרו' : 'Remaining'}
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalCount - spottedCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Camera className="w-4 h-4" />
            <span className="text-xs font-bold text-stone-600">
              {language === 'he' ? 'תמונות שצולמו' : 'Photos Taken'}
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">{photoCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold text-stone-600">
              {language === 'he' ? 'מיקומים מתועדים' : 'Locations Logged'}
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">{locationCount}</div>
        </div>
      </div>

      {/* 4 Regional Breakdown Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <h3 id="regional-stats-title" className="text-sm font-bold text-stone-900 mb-3">
          {language === 'he' ? 'התקדמות לפי 4 אזורי ארה״ב' : 'Completion by 4 US Regions'}
        </h3>
        <div className="space-y-3">
          {regionStats.map((reg) => (
            <div key={reg.region} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-700 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: reg.color }}
                  />
                  {language === 'he' ? reg.nameHe : reg.nameEn}
                </span>
                <span className="text-stone-500 font-mono">
                  {reg.spotted} / {reg.total} ({reg.percent}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                <div
                  className="rounded-full h-full transition-all duration-500"
                  style={{ width: `${reg.percent}%`, backgroundColor: reg.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sightings Feed */}
      {recentSightings.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <h3 id="recent-sightings-title" className="text-sm font-bold text-stone-900 mb-3">
            {language === 'he' ? 'תיעודים אחרונים מהדרך' : 'Recent Sightings Timeline'}
          </h3>
          <div className="space-y-2.5">
            {recentSightings.map((rec) => {
              const state = STATES_DATA[rec.stateId];
              if (!state) return null;

              const dateStr = new Date(rec.spottedAt).toLocaleDateString(
                language === 'he' ? 'he-IL' : 'en-US',
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              );

              return (
                <div
                  key={rec.stateId}
                  id={`recent-sighting-${rec.stateId}`}
                  onClick={() => onSelectState(state)}
                  className="p-2.5 bg-stone-50 hover:bg-emerald-50/50 rounded-xl border border-stone-200 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                      {state.id}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-stone-900 truncate">
                        {language === 'he' ? state.nameHe : state.name}
                      </div>
                      {rec.location && (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{rec.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-stone-600 block">{dateStr}</span>
                    {rec.photoUrl && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                        <Camera className="w-2.5 h-2.5" />
                        {language === 'he' ? 'תמונה' : 'Photo'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share / Postcard Modal */}
      {showShareModal && (
        <div
          id="share-modal-backdrop"
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
          onClick={() => setShowShareModal(false)}
        >
          <div
            id="share-modal-card"
            className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-stone-200 my-auto text-right"
            dir={language === 'he' ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-stone-900 text-base">
                  {language === 'he' ? 'גלוית מסע לשיתוף' : 'Road Trip Postcard'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Postcard Preview */}
            <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 text-stone-800 font-sans text-xs whitespace-pre-line leading-relaxed mb-4 select-all shadow-inner">
              {generateShareText()}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                {language === 'he' ? 'סגור' : 'Close'}
              </button>
              <button
                id="btn-copy-share-text"
                type="button"
                onClick={handleCopyShare}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedText
                  ? language === 'he'
                    ? 'הועתק ללוח!'
                    : 'Copied!'
                  : language === 'he'
                  ? 'העתק טקסט לשיתוף'
                  : 'Copy Postcard Text'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
