import React from 'react';
import { TripSettings } from '../types';
import { getRankDetails } from '../utils/storage';
import {
  Map,
  List,
  Trophy,
  BarChart3,
  Plus,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'list' | 'achievements' | 'stats';
  onTabChange: (tab: 'map' | 'list' | 'achievements' | 'stats') => void;
  spottedCount: number;
  totalStates?: number;
  onOpenAddModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: 'he' | 'en';
  onToggleLanguage: () => void;
  unlockedBadgesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  spottedCount,
  totalStates = 50,
  onOpenAddModal,
  soundEnabled,
  onToggleSound,
  language,
  onToggleLanguage,
  unlockedBadgesCount,
}) => {
  const rank = getRankDetails(spottedCount, language);
  const percent = Math.round((spottedCount / totalStates) * 100);

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Trip Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-xs text-white shrink-0">
              🇺🇸
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 id="app-brand-title" className="font-extrabold text-base sm:text-lg text-stone-900 leading-tight">
                  {language === 'he' ? 'משחק לוחיות הרישוי' : 'US License Plate Game'}
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  ROAD TRIP
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                <span className="text-emerald-700 font-bold">
                  {spottedCount}/{totalStates} {language === 'he' ? 'נמצאו' : 'spotted'} ({percent}%)
                </span>
                <span>•</span>
                <span className="truncate">{rank.badge} {rank.title}</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              type="button"
              onClick={onToggleSound}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-stone-600 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 rounded-xl transition-colors active:scale-95"
              title={
                soundEnabled
                  ? language === 'he'
                    ? 'השתק צלילים'
                    : 'Mute sounds'
                  : language === 'he'
                  ? 'הפעל צלילים'
                  : 'Unmute sounds'
              }
              aria-label="Sound Toggle"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-stone-400" />}
            </button>

            {/* Language Switch */}
            <button
              id="btn-toggle-language"
              type="button"
              onClick={onToggleLanguage}
              className="h-10 sm:h-11 px-3 text-xs sm:text-sm font-bold text-stone-700 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 rounded-xl transition-colors border border-stone-200 flex items-center gap-1.5 active:scale-95"
              title="Switch Language / החלף שפה"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'he' ? 'EN' : 'עברית'}</span>
            </button>

            {/* Primary Action Button: Add Plate */}
            <button
              id="btn-add-plate-navbar"
              type="button"
              onClick={onOpenAddModal}
              className="h-10 sm:h-11 px-3.5 sm:px-5 text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>{language === 'he' ? 'הוסף לוחית' : 'Spot Plate'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-stone-100">
          <button
            id="nav-tab-map"
            type="button"
            onClick={() => onTabChange('map')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'map'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>{language === 'he' ? 'מפה אינטראקטיבית' : 'Interactive Map'}</span>
          </button>

          <button
            id="nav-tab-list"
            type="button"
            onClick={() => onTabChange('list')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'list'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{language === 'he' ? 'כל המדינות' : 'All States'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono">
              50
            </span>
          </button>

          <button
            id="nav-tab-achievements"
            type="button"
            onClick={() => onTabChange('achievements')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 relative ${
              activeTab === 'achievements'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{language === 'he' ? 'הישגים ותגים' : 'Achievements'}</span>
            {unlockedBadgesCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                {unlockedBadgesCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-stats"
            type="button"
            onClick={() => onTabChange('stats')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'stats'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{language === 'he' ? 'יומן וסטטיסטיקה' : 'Stats & Log'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
