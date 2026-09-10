import React, { useState, useMemo } from 'react';
import { StateInfo, SpottedRecord, Region } from '../types';
import { STATES_DATA } from '../data/statesData';
import { US_REGIONS, REGION_ORDER } from '../data/regionsData';
import {
  Search,
  CheckCircle2,
  PlusCircle,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PlateListViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectState: (state: StateInfo) => void;
  onQuickLog: (state: StateInfo) => void;
  language?: 'he' | 'en';
}

export const PlateListView: React.FC<PlateListViewProps> = ({
  spottedRecords,
  onSelectState,
  onQuickLog,
  language = 'he',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'spotted' | 'missing'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('name');

  const allStates = useMemo(() => Object.values(STATES_DATA), []);

  const spottedCount = Object.keys(spottedRecords).length;
  const missingCount = allStates.length - spottedCount;

  const filteredStates = useMemo(() => {
    return allStates
      .filter((state) => {
        const isSpotted = Boolean(spottedRecords[state.id]);

        // Status filter
        if (statusFilter === 'spotted' && !isSpotted) return false;
        if (statusFilter === 'missing' && isSpotted) return false;

        // Region filter
        if (regionFilter !== 'all' && state.region !== regionFilter) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = state.name.toLowerCase().includes(q);
          const matchNameHe = state.nameHe.toLowerCase().includes(q);
          const matchId = state.id.toLowerCase().includes(q);
          const matchCapital = state.capital.toLowerCase().includes(q);
          const matchCapitalHe = state.capitalHe.toLowerCase().includes(q);
          return matchName || matchNameHe || matchId || matchCapital || matchCapitalHe;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          const dateA = spottedRecords[a.id]?.spottedAt
            ? new Date(spottedRecords[a.id].spottedAt).getTime()
            : 0;
          const dateB = spottedRecords[b.id]?.spottedAt
            ? new Date(spottedRecords[b.id].spottedAt).getTime()
            : 0;
          return dateB - dateA;
        }
        return a.name.localeCompare(b.name);
      });
  }, [allStates, spottedRecords, statusFilter, regionFilter, searchQuery, sortBy]);

  return (
    <div id="plate-list-view-container" className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="states-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'he'
                  ? 'חפש מדינה (למשל: קליפורניה, CA, ניו יורק...)'
                  : 'Search state by name or code (e.g. CA, Texas)...'
              }
              className="w-full pr-11 pl-4 py-3 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[46px]"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600 whitespace-nowrap">
              {language === 'he' ? 'מיון לפי:' : 'Sort:'}
            </span>
            <select
              id="states-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            >
              <option value="name">{language === 'he' ? 'שם (A-Z)' : 'Name (A-Z)'}</option>
              <option value="recent">{language === 'he' ? 'נמצאו לאחרונה' : 'Recently Spotted'}</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="filter-status-all"
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] ${
                statusFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {language === 'he' ? `הכל (${allStates.length})` : `All (${allStates.length})`}
            </button>
            <button
              id="filter-status-spotted"
              type="button"
              onClick={() => setStatusFilter('spotted')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 min-h-[40px] ${
                statusFilter === 'spotted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {language === 'he' ? `נמצאו (${spottedCount})` : `Spotted (${spottedCount})`}
            </button>
            <button
              id="filter-status-missing"
              type="button"
              onClick={() => setStatusFilter('missing')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 min-h-[40px] ${
                statusFilter === 'missing'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {language === 'he' ? `חסרות (${missingCount})` : `Remaining (${missingCount})`}
            </button>
          </div>

          {/* 4 Regions Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              id="filter-reg-all"
              type="button"
              onClick={() => setRegionFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                regionFilter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              {language === 'he' ? 'כל 4 האזורים' : 'All 4 Regions'}
            </button>
            {REGION_ORDER.map((regKey) => {
              const reg = US_REGIONS[regKey];
              const isSelected = regionFilter === regKey;
              return (
                <button
                  key={regKey}
                  id={`filter-reg-${regKey}`}
                  type="button"
                  onClick={() => setRegionFilter(regKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isSelected
                      ? 'shadow-xs text-white'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: reg.color, borderColor: reg.borderColor }
                      : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : reg.color }}
                  />
                  {language === 'he' ? reg.nameHe : reg.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* States Grid */}
      {filteredStates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm font-semibold text-stone-600">
            {language === 'he' ? 'לא נמצאו מדינות התואמות לחיפוש' : 'No states match your search'}
          </p>
          <button
            id="btn-reset-filters"
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setRegionFilter('all');
            }}
            className="mt-3 px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100"
          >
            {language === 'he' ? 'אפס סינונים' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStates.map((state) => {
            const record = spottedRecords[state.id];
            const isSpotted = Boolean(record);
            const region = US_REGIONS[state.region];

            return (
              <div
                key={state.id}
                id={`state-card-${state.id}`}
                onClick={() => onSelectState(state)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  isSpotted
                    ? 'bg-white border-emerald-300 ring-1 ring-emerald-500/20'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs"
                        style={{ backgroundColor: region.color }}
                      >
                        {state.id}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 leading-tight">
                          {language === 'he' ? state.nameHe : state.name}
                        </h4>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {state.name} • {language === 'he' ? state.capitalHe : state.capital}
                        </span>
                      </div>
                    </div>

                    {isSpotted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'he' ? 'נמצאה' : 'Spotted'}
                      </span>
                    ) : (
                      <button
                        id={`quick-log-btn-${state.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickLog(state);
                        }}
                        className="h-9 px-3.5 py-1.5 text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-200 shrink-0 flex items-center gap-1.5 active:scale-95 shadow-2xs"
                      >
                        <PlusCircle className="w-4 h-4" />
                        {language === 'he' ? 'תעד' : 'Spot'}
                      </button>
                    )}
                  </div>

                  {/* Region & Slogan Header Badge */}
                  <div className="flex items-center justify-between mt-2.5 px-2.5 py-1.5 rounded-xl text-xs" style={{ backgroundColor: region.lightColor }}>
                    <span className="text-[11px] font-bold" style={{ color: region.borderColor }}>
                      {language === 'he' ? region.nameHe : region.nameEn}
                    </span>
                    <span className="text-[11px] text-stone-600 truncate max-w-[170px] italic">
                      "{state.slogan}"
                    </span>
                  </div>
                </div>

                {/* Sighting Details */}
                <div className="mt-3 pt-2 border-t border-stone-100 text-xs">
                  {isSpotted && record ? (
                    <div className="space-y-1 text-stone-600">
                      {record.location && (
                        <div className="flex items-center gap-1 text-[11px] text-stone-700 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{record.location}</span>
                        </div>
                      )}
                      {record.photoUrl && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <Camera className="w-3 h-3" />
                          <span>{language === 'he' ? 'יש תמונה מתועדת' : 'Photo attached'}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-400">
                      {language === 'he' ? 'לחץ לפרטים או לסימון המדינה' : 'Click to view details or spot'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
