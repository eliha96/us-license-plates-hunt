import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { StateInfo, SpottedRecord, TripSettings, Achievement } from './types';
import { STATES_DATA } from './data/statesData';
import { ACHIEVEMENTS } from './data/achievements';
import {
  loadSpottedFromStorage,
  saveSpottedToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
} from './utils/storage';
import { sounds } from './utils/audio';

import { MapView } from './components/MapView';
import { DiscoveriesView } from './components/DiscoveriesView';
import { SightingsPageView } from './components/SightingsPageView';
import { AchievementsView } from './components/AchievementsView';
import { AddPlateModal } from './components/AddPlateModal';
import { StateDetailsModal } from './components/StateDetailsModal';
import { AchievementToast } from './components/AchievementToast';
import { ShareModal } from './components/ShareModal';
import {
  CANADA_PROVINCES_DATA,
  MEXICO_DATA,
  ALL_BONUS_DATA,
  isCanadaUnlocked,
  isMexicoUnlocked,
  CANADA_UNLOCK_THRESHOLD,
  MEXICO_UNLOCK_THRESHOLD,
} from './data/bonusData';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { BonusUnlockModal } from './components/BonusUnlockModal';

import {
  Car,
  Camera,
  MapPin,
  Trophy,
  Plus,
  Volume2,
  VolumeX,
  Languages,
  RotateCcw,
  Share2,
  Download,
} from 'lucide-react';

const REGION_COLORS: Record<string, string> = {
  West: '#f59e0b',
  Midwest: '#10b981',
  South: '#ef4444',
  Northeast: '#6366f1',
};

// Circular Progress Ring component
function CircularProgressRing({
  value,
  total = 50,
  size = 88,
  stroke = 8,
  language = 'he',
}: {
  value: number;
  total?: number;
  size?: number;
  stroke?: number;
  language?: 'he' | 'en';
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total ? Math.min(1, Math.max(0, value / total)) : 0;
  const offset = circ * (1 - pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-extrabold text-slate-800 leading-none">
          {value}
          <span className="text-slate-300 text-xs">/{total}</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
          {language === 'he' ? 'נמצאו' : 'found'}
        </span>
      </div>
    </div>
  );
}

const ALL_COMBINED_STATES: Record<string, StateInfo> = {
  ...STATES_DATA,
  ...ALL_BONUS_DATA,
};

export default function App() {
  const [spottedRecords, setSpottedRecords] = useState<Record<string, SpottedRecord>>(() =>
    loadSpottedFromStorage()
  );
  const [settings, setSettings] = useState<TripSettings>(() => loadSettingsFromStorage());
  const [activeTab, setActiveTab] = useState<'hunt' | 'discoveries' | 'sightings' | 'achievements'>('hunt');

  // Modals state
  const [selectedState, setSelectedState] = useState<StateInfo | null>(null);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<SpottedRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [shareTargetState, setShareTargetState] = useState<StateInfo | null>(null);

  // Bonus milestone unlocks toast state
  const [bonusUnlockToast, setBonusUnlockToast] = useState<{ type: 'canada' | 'mexico' } | null>(null);
  const prevUsCountRef = useRef<number>(
    Object.keys(spottedRecords).filter((id) => STATES_DATA[id]).length
  );

  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  useEffect(() => {
    const inStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(inStandaloneMode);
  }, []);

  // First-time onboarding language prompt
  const [showLangOnboarding, setShowLangOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('us_plate_game_has_chosen_lang_v1');
  });

  const handleSelectInitialLanguage = (lang: 'he' | 'en') => {
    setSettings((s) => ({ ...s, language: lang }));
    localStorage.setItem('us_plate_game_has_chosen_lang_v1', 'true');
    setShowLangOnboarding(false);
  };

  const handleOpenShareModal = (st?: StateInfo | null) => {
    setShareTargetState(st || null);
    setIsShareModalOpen(true);
  };

  // Achievement unlock tracker
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);
  const prevUnlockedIdsRef = useRef<Set<string>>(new Set());

  // Sound sync
  useEffect(() => {
    sounds.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist storage
  useEffect(() => {
    saveSpottedToStorage(spottedRecords);
  }, [spottedRecords]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Sync document language and dir
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'he' ? 'rtl' : 'ltr';
  }, [settings.language]);

  // Track achievements on initial load
  useEffect(() => {
    const currentUnlocked = new Set<string>();
    ACHIEVEMENTS.forEach((ach) => {
      if (ach.checkUnlocked(spottedRecords)) {
        currentUnlocked.add(ach.id);
      }
    });
    prevUnlockedIdsRef.current = currentUnlocked;
  }, []);

  const checkForNewAchievements = (updatedRecords: Record<string, SpottedRecord>) => {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach((ach) => {
      const isNowUnlocked = ach.checkUnlocked(updatedRecords);
      const wasUnlocked = prevUnlockedIdsRef.current.has(ach.id);

      if (isNowUnlocked && !wasUnlocked) {
        newlyUnlocked.push(ach);
        prevUnlockedIdsRef.current.add(ach.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      const latest = newlyUnlocked[0];
      setUnlockedToast(latest);
      sounds.playAchievementSound();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }

      setTimeout(() => {
        setUnlockedToast((prev) => (prev?.id === latest.id ? null : prev));
      }, 6000);
    }
  };

  const handleSaveRecord = (record: SpottedRecord) => {
    const isNew = !spottedRecords[record.stateId];
    const updated = {
      ...spottedRecords,
      [record.stateId]: record,
    };
    setSpottedRecords(updated);
    setIsAddModalOpen(false);

    // Play victory sound on new state discovery!
    if (isNew) {
      sounds.playVictorySound();
    } else {
      sounds.playSpotSound();
    }

    try {
      confetti({
        particleCount: isNew ? 90 : 45,
        spread: 75,
        origin: { y: 0.65 },
      });
    } catch {
      // Confetti fallback
    }

    // Check bonus milestone unlocks
    checkForBonusUnlocks(updated);

    // Immediately display the Discovery Card (Plate, Slogan, Details, Facts)
    const targetState = ALL_COMBINED_STATES[record.stateId];
    if (targetState) {
      setSelectedState(targetState);
      setIsDetailsModalOpen(true);
    }

    checkForNewAchievements(updated);
  };

  const checkForBonusUnlocks = (updatedRecords: Record<string, SpottedRecord>) => {
    const prevUs = prevUsCountRef.current;
    const currentUs = Object.keys(updatedRecords).filter((id) => STATES_DATA[id]).length;

    if (prevUs < CANADA_UNLOCK_THRESHOLD && currentUs >= CANADA_UNLOCK_THRESHOLD) {
      setBonusUnlockToast({ type: 'canada' });
    } else if (prevUs < MEXICO_UNLOCK_THRESHOLD && currentUs >= MEXICO_UNLOCK_THRESHOLD) {
      setBonusUnlockToast({ type: 'mexico' });
    }

    prevUsCountRef.current = currentUs;
  };

  const handleDeleteRecord = (stateId: string) => {
    const updated = { ...spottedRecords };
    delete updated[stateId];
    setSpottedRecords(updated);

    const newUnlocked = new Set<string>();
    ACHIEVEMENTS.forEach((ach) => {
      if (ach.checkUnlocked(updated)) {
        newUnlocked.add(ach.id);
      }
    });
    prevUnlockedIdsRef.current = newUnlocked;
  };

  const handleSelectStateFromMap = (state: StateInfo) => {
    setSelectedState(state);
    if (spottedRecords[state.id]) {
      setIsDetailsModalOpen(true);
    } else {
      setSelectedRecordForEdit(null);
      setIsAddModalOpen(true);
    }
    sounds.playTapSound();
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    setSettings((s) => ({ ...s, soundEnabled: next }));
  };

  const handleToggleLanguage = () => {
    const next = settings.language === 'he' ? 'en' : 'he';
    setSettings((s) => ({ ...s, language: next }));
  };

  const handleResetTrip = () => {
    if (
      window.confirm(
        settings.language === 'he'
          ? 'האם אתה בטוח שברצונך לאפס את נתוני המסע?'
          : 'Are you sure you want to reset all trip progress?'
      )
    ) {
      setSpottedRecords({});
      prevUnlockedIdsRef.current = new Set();
    }
  };


  const usFoundCount = Object.keys(spottedRecords).filter((id) => STATES_DATA[id]).length;
  const canadaSpottedCount = Object.keys(spottedRecords).filter((id) => CANADA_PROVINCES_DATA[id]).length;
  const mexicoSpottedCount = Object.keys(spottedRecords).filter((id) => MEXICO_DATA[id]).length;

  const canadaUnlocked = isCanadaUnlocked(usFoundCount);
  const mexicoUnlocked = isMexicoUnlocked(usFoundCount);
  const foundCount = usFoundCount;
  const remainingCount = 50 - foundCount;
  const percentComplete = Math.round((foundCount / 50) * 100);

  // Recently discovered states (up to 8, newest first)
  const recentDiscovered: StateInfo[] = (Object.values(spottedRecords) as SpottedRecord[])
    .sort(
      (a, b) => new Date(b.spottedAt).getTime() - new Date(a.spottedAt).getTime()
    )
    .map((r) => STATES_DATA[r.stateId])
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div
      id="plate-hunt-app"
      className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white"
    >
      {/* Centered Mobile App Container */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col pb-24 border-x border-slate-100 relative">
        {/* App Header */}
        <header className="p-4 sm:p-5 pb-2 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <img src="/app-icon.png" alt="App Logo" className="w-8 h-8 rounded-xl object-cover shadow-xs border border-slate-200/80 shrink-0" />
              <span>{settings.language === 'he' ? 'ציד לוחיות רישוי' : '50 State Plate Hunt'}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {settings.language === 'he'
                ? 'זהו לוחיות רישוי מכל 50 המדינות'
                : 'Spot plates from every state on your adventure'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Download App Button (shows as long as app is in browser mode and not installed) */}
            {!isStandalone && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
                }}
                title={settings.language === 'he' ? 'הורד את האפליקציה למכשיר' : 'Download App to Device'}
                className="p-2 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline text-xs font-extrabold text-amber-900">
                  {settings.language === 'he' ? 'הורד' : 'Download'}
                </span>
              </button>
            )}

            {/* Share Progress Button */}
            <button
              type="button"
              onClick={() => handleOpenShareModal(null)}
              title={settings.language === 'he' ? 'שתף תמונת התקדמות' : 'Share Graphic Progress'}
              className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={handleToggleLanguage}
              title={settings.language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <Languages className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Reset Data - Prominent Warning Style */}
            {foundCount > 0 && (
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                title={settings.language === 'he' ? 'איפוס כל נתוני המסע' : 'Reset all trip progress'}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>{settings.language === 'he' ? 'איפוס' : 'Reset'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Tab Content */}
        <main className="flex-1 p-4 sm:p-5 space-y-4">
          {/* TAB 1: HUNT (Home Screen) */}
          {activeTab === 'hunt' && (
            <div className="space-y-4">
              {/* Hero Progress Card */}
              <div className="rounded-3xl bg-gradient-to-br from-white via-white to-indigo-50/30 p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-center gap-4.5">
                <CircularProgressRing
                  value={foundCount}
                  total={50}
                  language={settings.language}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                      {settings.language === 'he'
                        ? `עוד ${remainingCount} לגילוי!`
                        : `${remainingCount} left to discover!`}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                      {percentComplete}%
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {settings.language === 'he'
                      ? `${foundCount} מתוך 50 מדינות נאספו`
                      : `${foundCount} of 50 states collected`}
                  </p>

                  <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-400 transition-all duration-500 shadow-2xs"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>

                  {/* Clickable Share Progress Link below progress bar */}
                  <div className="mt-2.5 pt-1.5 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenShareModal(null)}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group transition-colors cursor-pointer"
                    >
                      <span>
                        {settings.language === 'he' ? 'שתף את ההתקדמות שלך' : 'Share your progress'}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                        {settings.language === 'he' ? '←' : '→'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bonus Unlock Progress Cards: Bonus 1 & Bonus 2 */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Bonus 1 */}
                <div
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    canadaUnlocked
                      ? 'bg-amber-500/10 border-amber-300/80 text-amber-950 shadow-xs'
                      : 'bg-slate-100/90 border-slate-200/80 text-slate-500 shadow-inner'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-xs mb-1">
                    <span className="flex items-center gap-1">
                      <span>{canadaUnlocked ? '🇨🇦' : '🔒'}</span>
                      <span>
                        {canadaUnlocked
                          ? settings.language === 'he'
                            ? 'בונוס 1: קנדה'
                            : 'Bonus 1: Canada'
                          : settings.language === 'he'
                          ? 'בונוס 1 (סודי)'
                          : 'Bonus 1 (Secret)'}
                      </span>
                    </span>
                    {canadaUnlocked && (
                      <span className="text-[10px] font-mono font-bold text-amber-700">
                        {canadaSpottedCount}/9
                      </span>
                    )}
                  </div>
                  {canadaUnlocked && (
                    <>
                      <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden my-1">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round((canadaSpottedCount / 9) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 truncate">
                        {canadaSpottedCount === 9
                          ? settings.language === 'he'
                            ? '🎉 הושלם! (9/9)'
                            : '🎉 Complete! (9/9)'
                          : settings.language === 'he'
                          ? `נמצאו ${canadaSpottedCount} מתוך 9`
                          : `Spotted ${canadaSpottedCount} of 9`}
                      </span>
                    </>
                  )}
                </div>

                {/* Bonus 2 */}
                <div
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    mexicoUnlocked
                      ? 'bg-emerald-500/10 border-emerald-300/80 text-emerald-950 shadow-xs'
                      : 'bg-slate-100/90 border-slate-200/80 text-slate-500 shadow-inner'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-xs mb-1">
                    <span className="flex items-center gap-1">
                      <span>{mexicoUnlocked ? '🇲🇽' : '🔒'}</span>
                      <span>
                        {mexicoUnlocked
                          ? settings.language === 'he'
                            ? 'בונוס 2: מקסיקו'
                            : 'Bonus 2: Mexico'
                          : settings.language === 'he'
                          ? 'בונוס 2 (סודי)'
                          : 'Bonus 2 (Secret)'}
                      </span>
                    </span>
                    {mexicoUnlocked && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700">
                        {mexicoSpottedCount}/1
                      </span>
                    )}
                  </div>
                  {mexicoUnlocked && (
                    <>
                      <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden my-1">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round((mexicoSpottedCount / 1) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 truncate">
                        {mexicoSpottedCount === 1
                          ? settings.language === 'he'
                            ? '🎉 הושלם! (1/1)'
                            : '🎉 Complete! (1/1)'
                          : settings.language === 'he'
                          ? `נמצאו ${mexicoSpottedCount} מתוך 1`
                          : `Spotted ${mexicoSpottedCount} of 1`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Recently Discovered Mini-Cards Carousel */}
              {recentDiscovered.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span>{settings.language === 'he' ? 'נמצאו לאחרונה' : 'Recently discovered'}</span>
                    <span className="text-[10px] text-indigo-500 font-semibold lowercase">
                      {recentDiscovered.length} {settings.language === 'he' ? 'מדינות' : 'states'}
                    </span>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
                    {recentDiscovered.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedState(st);
                          setIsDetailsModalOpen(true);
                          sounds.playTapSound();
                        }}
                        className="flex flex-col items-center p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-200 active:scale-95 transition-all min-w-[90px] shrink-0 cursor-pointer text-center group"
                      >
                        <div
                          className="h-8 px-2.5 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-2xs ring-1 ring-white"
                          style={{
                            backgroundColor: REGION_COLORS[st.region] || '#6366f1',
                          }}
                        >
                          {st.id}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1.5 truncate max-w-[80px]">
                          {settings.language === 'he' ? st.nameHe : st.name}
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                          <span>✓</span>
                          <span>{settings.language === 'he' ? 'נמצאה' : 'Spotted'}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive US Leaflet Map */}
              <div className="space-y-1">
                <MapView
                  spottedRecords={spottedRecords}
                  onSelectState={handleSelectStateFromMap}
                  language={settings.language}
                />
              </div>

              {/* Empty Starter Notice */}
              {foundCount === 0 && (
                <div className="rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 p-4 text-center">
                  <p className="text-sm font-bold text-indigo-700">
                    {settings.language === 'he'
                      ? 'הרפתקת לוחיות הרישוי שלכם מתחילה כאן! 🚗🇺🇸'
                      : 'Your license plate adventure starts here! 🚗🇺🇸'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {settings.language === 'he'
                      ? 'לחצו על מדינה במפה או על ״הוסף תגלית״ כדי לתעד את הלוחית הראשונה.'
                      : 'Tap a state on the map or “Add a Discovery” to log your first plate.'}
                  </p>
                </div>
              )}

              {/* Big Prominent Action Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedState(null);
                  setSelectedRecordForEdit(null);
                  setIsAddModalOpen(true);
                  sounds.playTapSound();
                }}
                className="w-full rounded-2xl text-base bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md h-12 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" />
                {settings.language === 'he' ? 'הוסף תגלית חדשה' : 'Add a Discovery'}
              </button>
            </div>
          )}

          {/* TAB 2: DISCOVERIES */}
          {activeTab === 'discoveries' && (
            <DiscoveriesView
              spottedRecords={spottedRecords}
              onSelectState={(st) => {
                setSelectedState(st);
                if (spottedRecords[st.id]) {
                  setIsDetailsModalOpen(true);
                } else {
                  setSelectedRecordForEdit(null);
                  setIsAddModalOpen(true);
                }
                sounds.playTapSound();
              }}
              onOpenSightingDetails={(rec) => {
                const st = STATES_DATA[rec.stateId];
                if (st) setSelectedState(st);
                setIsDetailsModalOpen(true);
                sounds.playTapSound();
              }}
              language={settings.language}
            />
          )}

          {/* TAB 3: SIGHTINGS (TRAVEL MAP) */}
          {activeTab === 'sightings' && (
            <SightingsPageView
              spottedRecords={spottedRecords}
              onSelectRecord={(rec) => {
                const st = STATES_DATA[rec.stateId];
                if (st) setSelectedState(st);
                setIsDetailsModalOpen(true);
                sounds.playTapSound();
              }}
              onEditRecord={(rec) => {
                const st = STATES_DATA[rec.stateId];
                if (st) setSelectedState(st);
                setSelectedRecordForEdit(rec);
                setIsAddModalOpen(true);
                sounds.playTapSound();
              }}
              onDeleteRecord={handleDeleteRecord}
              onAddDiscovery={() => {
                setSelectedState(null);
                setSelectedRecordForEdit(null);
                setIsAddModalOpen(true);
                sounds.playTapSound();
              }}
              language={settings.language}
            />
          )}

          {/* TAB 4: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <AchievementsView
              spottedRecords={spottedRecords}
              language={settings.language}
            />
          )}
        </main>

        {/* Modern Frosted Glass Bottom Navigation Bar with Central Floating Action Button */}
        <nav
          id="app-bottom-nav"
          className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-lg shadow-slate-900/5"
        >
          {/* 1: Hunt */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('hunt');
              sounds.playTapSound();
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'hunt'
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all ${
                activeTab === 'hunt' ? 'bg-indigo-100/80 scale-105 text-indigo-600 shadow-2xs' : ''
              }`}
            >
              <Car className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">
              {settings.language === 'he' ? 'ציד' : 'Hunt'}
            </span>
          </button>

          {/* 2: Discoveries */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('discoveries');
              sounds.playTapSound();
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'discoveries'
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all ${
                activeTab === 'discoveries' ? 'bg-indigo-100/80 scale-105 text-indigo-600 shadow-2xs' : ''
              }`}
            >
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">
              {settings.language === 'he' ? 'תגליות' : 'Discoveries'}
            </span>
          </button>

          {/* Center: Prominent Elevated Floating "+" Action Button */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedState(null);
                setSelectedRecordForEdit(null);
                setIsAddModalOpen(true);
                sounds.playTapSound();
              }}
              aria-label={settings.language === 'he' ? 'הוסף תגלית חדשה' : 'Add a Discovery'}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 border-[3px] border-white flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all group"
            >
              <Plus className="w-6 h-6 stroke-[2.8] group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* 3: Sightings */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('sightings');
              sounds.playTapSound();
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'sightings'
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all ${
                activeTab === 'sightings' ? 'bg-indigo-100/80 scale-105 text-indigo-600 shadow-2xs' : ''
              }`}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">
              {settings.language === 'he' ? 'מסלול' : 'Sightings'}
            </span>
          </button>

          {/* 4: Achievements */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('achievements');
              sounds.playTapSound();
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all ${
                activeTab === 'achievements' ? 'bg-indigo-100/80 scale-105 text-indigo-600 shadow-2xs' : ''
              }`}
            >
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">
              {settings.language === 'he' ? 'הישגים' : 'Badges'}
            </span>
          </button>
        </nav>
      </div>

      {/* State Details Modal */}
      <StateDetailsModal
        state={selectedState}
        record={selectedState ? spottedRecords[selectedState.id] : null}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(st) => {
          setSelectedRecordForEdit(spottedRecords[st.id]);
          setIsDetailsModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onLogNew={(st) => {
          setSelectedRecordForEdit(null);
          setIsDetailsModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onShare={(st) => {
          handleOpenShareModal(st);
        }}
        language={settings.language}
      />

      {/* Add / Edit Plate Modal */}
      <AddPlateModal
        initialState={selectedState}
        existingRecord={selectedRecordForEdit}
        spottedRecords={spottedRecords}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedRecordForEdit(null);
        }}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        language={settings.language}
      />

      {/* Share Graphic Card Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareTargetState(null);
        }}
        spottedRecords={spottedRecords}
        targetState={shareTargetState}
        language={settings.language}
      />

      {/* Unlocked Badge Toast */}
      {unlockedToast && (
        <AchievementToast
          achievement={unlockedToast}
          onClose={() => setUnlockedToast(null)}
          language={settings.language}
        />
      )}

      {/* First-Time User Language Selection Modal (In English) */}
      {showLangOnboarding && (
        <div
          id="onboarding-language-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          dir="ltr"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-md mx-auto text-white">
              🇺🇸
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Welcome to US License Plate Hunt! 🚗
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Spot, photograph, and log license plates from all 50 states. Please select your preferred language to get started:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('en')}
                className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-900 font-extrabold text-sm flex flex-col items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="text-2xl">🇺🇸</span>
                <span>English</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('he')}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-900 font-extrabold text-sm flex flex-col items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="text-2xl">🇮🇱</span>
                <span>עברית (Hebrew)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div
          id="reset-trip-confirm-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          dir={settings.language === 'he' ? 'rtl' : 'ltr'}
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
              ⚠️
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {settings.language === 'he' ? 'איפוס נתוני המסע?' : 'Reset Trip Progress?'}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {settings.language === 'he'
                  ? 'פעולה זו תמחק את כל הלוחיות, התמונות וההישגים שרשמת. לא ניתן לבטל פעולה זו!'
                  : 'This will erase all logged state plates, photos, and earned badges. This action cannot be undone!'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {settings.language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpottedRecords({});
                  prevUnlockedIdsRef.current = new Set();
                  setIsResetModalOpen(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {settings.language === 'he' ? 'כן, אפס הכל' : 'Yes, Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Full-Screen Darkened Bonus Celebration Modal */}
      <BonusUnlockModal
        type={bonusUnlockToast?.type || null}
        isOpen={Boolean(bonusUnlockToast)}
        onClose={() => setBonusUnlockToast(null)}
        language={settings.language}
      />

      {/* PWA Home Screen Banner */}
      <InstallPwaBanner language={settings.language} />
    </div>
  );
}
