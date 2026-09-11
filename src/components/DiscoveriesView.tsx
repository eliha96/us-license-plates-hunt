import React, { useState } from 'react';
import { StateInfo, SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
import {
  CANADA_PROVINCES_DATA,
  MEXICO_DATA,
  ALL_BONUS_DATA,
  isCanadaUnlocked,
  isMexicoUnlocked,
  CANADA_UNLOCK_THRESHOLD,
  MEXICO_UNLOCK_THRESHOLD,
} from '../data/bonusData';
import {
  Camera,
  CheckCircle2,
  Lock,
  Search,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface DiscoveriesViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectState: (state: StateInfo) => void;
  onOpenSightingDetails?: (record: SpottedRecord) => void;
  language?: 'he' | 'en';
}

const REGION_COLORS: Record<string, string> = {
  West: '#f59e0b',
  Midwest: '#10b981',
  South: '#ef4444',
  Northeast: '#6366f1',
};

const ALL_COMBINED_STATES: Record<string, StateInfo> = {
  ...STATES_DATA,
  ...ALL_BONUS_DATA,
};

export const DiscoveriesView: React.FC<DiscoveriesViewProps> = ({
  spottedRecords,
  onSelectState,
  onOpenSightingDetails,
  language = 'he',
}) => {
  const [subTab, setSubTab] = useState<'states' | 'log'>('states');
  const [countryCategory, setCountryCategory] = useState<'us' | 'canada' | 'mexico'>('us');
  const [statusFilter, setStatusFilter] = useState<'all' | 'found' | 'missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const usFoundCount = Object.keys(spottedRecords).filter((id) => STATES_DATA[id]).length;
  const canadaUnlocked = isCanadaUnlocked(usFoundCount);
  const mexicoUnlocked = isMexicoUnlocked(usFoundCount);

  const foundSet = new Set(Object.keys(spottedRecords));

  const targetCategoryDataset =
    countryCategory === 'canada'
      ? Object.values(CANADA_PROVINCES_DATA)
      : countryCategory === 'mexico'
      ? Object.values(MEXICO_DATA)
      : Object.values(STATES_DATA);

  // Filter states
  const filteredStates = targetCategoryDataset.filter((st) => {
    const isFound = foundSet.has(st.id);
    if (statusFilter === 'found' && !isFound) return false;
    if (statusFilter === 'missing' && isFound) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = st.name.toLowerCase().includes(q);
      const matchHe = st.nameHe.toLowerCase().includes(q);
      const matchCode = st.id.toLowerCase().includes(q);
      return matchName || matchHe || matchCode;
    }
    return true;
  });

  // Sightings array sorted recent first
  const sightingsList = (Object.values(spottedRecords) as SpottedRecord[]).sort(
    (a, b) => new Date(b.spottedAt).getTime() - new Date(a.spottedAt).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="pt-1">
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          📸 {language === 'he' ? 'תגליות ואוסף' : 'Discoveries'}
        </h1>
        <p className="text-sm text-slate-500">
          {language === 'he'
            ? 'האוסף המלא של המדינות והלוחיות שגיליתם'
            : 'Your collection of states and sightings'}
        </p>
      </header>

      {/* Sub-Tabs: States vs Log */}
      <div className="flex bg-slate-100 p-1 rounded-2xl ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => setSubTab('states')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            subTab === 'states'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'he' ? `מדינות (${usFoundCount}/50)` : `States (${usFoundCount}/50)`}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('log')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            subTab === 'log'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'he' ? `יומן תיעוד (${sightingsList.length})` : `Sightings (${sightingsList.length})`}
        </button>
      </div>

      {subTab === 'states' ? (
        <div className="space-y-3">
          {/* Country Category Selector Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setCountryCategory('us')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 shrink-0 ${
                countryCategory === 'us'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🇺🇸</span>
              <span>{language === 'he' ? 'ארה״ב (50)' : 'USA (50)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCountryCategory('canada')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 shrink-0 ${
                countryCategory === 'canada'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : canadaUnlocked
                  ? 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-400 opacity-80'
              }`}
            >
              <span>🇨🇦</span>
              <span>{language === 'he' ? 'קנדה (בונוס)' : 'Canada (Bonus)'}</span>
              {!canadaUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={() => setCountryCategory('mexico')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 shrink-0 ${
                countryCategory === 'mexico'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : mexicoUnlocked
                  ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400 opacity-80'
              }`}
            >
              <span>🇲🇽</span>
              <span>{language === 'he' ? 'מקסיקו (בונוס)' : 'Mexico (Bonus)'}</span>
              {!mexicoUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
            </button>
          </div>

          {/* Locked Bonus Notice for Canada */}
          {countryCategory === 'canada' && !canadaUnlocked && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-black text-lg">
                🔒
              </div>
              <h3 className="font-extrabold text-amber-900 text-sm">
                {language === 'he' ? 'פרובינציות קנדה נעולות' : 'Canada Provinces Locked'}
              </h3>
              <p className="text-xs text-amber-800 font-medium max-w-xs mx-auto">
                {language === 'he'
                  ? `גלו עוד ${Math.max(0, CANADA_UNLOCK_THRESHOLD - usFoundCount)} מדינות בארה״ב כדי לפתוח את 9 הפרובינציות בגבול קנדה!`
                  : `Spot ${Math.max(0, CANADA_UNLOCK_THRESHOLD - usFoundCount)} more US states to unlock Canada’s 9 border provinces!`}
              </p>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (usFoundCount / CANADA_UNLOCK_THRESHOLD) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-amber-700">
                {usFoundCount}/{CANADA_UNLOCK_THRESHOLD} {language === 'he' ? 'מדינות ארה״ב נמצאו' : 'US States Spotted'}
              </p>
            </div>
          )}

          {/* Locked Bonus Notice for Mexico */}
          {countryCategory === 'mexico' && !mexicoUnlocked && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black text-lg">
                🔒
              </div>
              <h3 className="font-extrabold text-emerald-900 text-sm">
                {language === 'he' ? 'לוחית מקסיקו נעולה' : 'Mexico License Plate Locked'}
              </h3>
              <p className="text-xs text-emerald-800 font-medium max-w-xs mx-auto">
                {language === 'he'
                  ? `גלו עוד ${Math.max(0, MEXICO_UNLOCK_THRESHOLD - usFoundCount)} מדינות בארה״ב כדי לפתוח את לוחית הבונוס של מקסיקו!`
                  : `Spot ${Math.max(0, MEXICO_UNLOCK_THRESHOLD - usFoundCount)} more US states to unlock Mexico’s bonus license plate!`}
              </p>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (usFoundCount / MEXICO_UNLOCK_THRESHOLD) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-emerald-700">
                {usFoundCount}/{MEXICO_UNLOCK_THRESHOLD} {language === 'he' ? 'מדינות ארה״ב נמצאו' : 'US States Spotted'}
              </p>
            </div>
          )}

          {/* Unlocked / US Content */}
          {(countryCategory === 'us' ||
            (countryCategory === 'canada' && canadaUnlocked) ||
            (countryCategory === 'mexico' && mexicoUnlocked)) && (
            <>
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'he'
                      ? 'חפש לפי שם או קוד...'
                      : 'Search by name or code...'
                  }
                  className="w-full pr-9 pl-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'he' ? `הכל (${targetCategoryDataset.length})` : `All (${targetCategoryDataset.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('found')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 ${
                    statusFilter === 'found'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'he'
                    ? `נמצאו (${targetCategoryDataset.filter((s) => foundSet.has(s.id)).length})`
                    : `Found (${targetCategoryDataset.filter((s) => foundSet.has(s.id)).length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('missing')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                    statusFilter === 'missing'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'he'
                    ? `חסרות (${targetCategoryDataset.filter((s) => !foundSet.has(s.id)).length})`
                    : `Missing (${targetCategoryDataset.filter((s) => !foundSet.has(s.id)).length})`}
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {filteredStates.map((st) => {
                  const isFound = foundSet.has(st.id);
                  const regionColor = REGION_COLORS[st.region] || '#6366f1';

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onSelectState(st)}
                      className={`rounded-2xl p-2.5 flex flex-col items-center justify-center transition-all relative group cursor-pointer active:scale-95 ${
                        isFound
                          ? 'text-white shadow-xs ring-1 ring-black/5'
                          : 'bg-slate-50 text-slate-400 border border-slate-200/80 hover:bg-slate-100'
                      }`}
                      style={isFound ? { backgroundColor: regionColor } : {}}
                    >
                      {isFound && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-[10px] text-white font-black">
                          ✓
                        </span>
                      )}
                      <span className="text-base font-black tracking-tight leading-none">
                        {st.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold mt-1 truncate w-full text-center ${
                          isFound ? 'text-white/90' : 'text-slate-500'
                        }`}
                      >
                        {language === 'he' ? st.nameHe : st.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredStates.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm font-bold">
                    {language === 'he' ? 'לא נמצאו פריטים' : 'No items match filter'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Sightings Log */
        <div className="space-y-3">
          {sightingsList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-3xl ring-1 ring-slate-100 p-6">
              <Camera className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">
                {language === 'he' ? 'אין עדיין תיעודים' : 'No sightings yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'he'
                  ? 'לחצו על "הוסף לוחית" בעמוד הראשי כדי לתעד את הראשונה שלכם.'
                  : 'Add a discovery to start your log.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sightingsList.map((rec) => {
                const st = ALL_COMBINED_STATES[rec.stateId] || STATES_DATA[rec.stateId];
                return (
                  <button
                    key={rec.stateId}
                    type="button"
                    onClick={() => {
                      if (onOpenSightingDetails) onOpenSightingDetails(rec);
                      else if (st) onSelectState(st);
                    }}
                    className="rounded-2xl overflow-hidden ring-1 ring-slate-200/80 bg-white text-left shadow-2xs hover:shadow-xs transition-all flex flex-col group active:scale-98"
                  >
                    <div className="h-28 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {rec.photoUrl ? (
                        <img
                          src={rec.photoUrl}
                          alt={st?.name || rec.stateId}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-2 text-white font-black text-center"
                          style={{
                            backgroundColor:
                              REGION_COLORS[st?.region || ''] || '#6366f1',
                          }}
                        >
                          <span className="text-2xl">{rec.stateId}</span>
                          <span className="text-[10px] font-bold opacity-90 truncate max-w-full">
                            {st?.name}
                          </span>
                        </div>
                      )}
                      <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {rec.stateId}
                      </span>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {language === 'he' ? st?.nameHe : st?.name}
                        </div>
                        {rec.location && (
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate">{rec.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {new Date(rec.spottedAt).toLocaleDateString(
                          language === 'he' ? 'he-IL' : 'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
