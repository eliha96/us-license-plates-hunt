import React from 'react';
import { StateInfo, SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
import { getRankDetails } from '../utils/storage';
import { LicensePlateBadge } from './LicensePlateBadge';
import { Base44MapView } from './Base44MapView';
import { Camera, Image as ImageIcon } from 'lucide-react';

const REGION_COLORS: Record<string, string> = {
  West: '#f59e0b',
  Midwest: '#10b981',
  South: '#ef4444',
  Northeast: '#6366f1',
};

interface ShareableCardProps {
  cardType: 'summary' | 'plate';
  spottedRecords: Record<string, SpottedRecord>;
  targetState?: StateInfo | null;
  language?: 'he' | 'en';
  theme?: 'vintage' | 'modern' | 'dark';
  plateVisualMode?: 'graphic' | 'photo';
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export const ShareableCard: React.FC<ShareableCardProps> = ({
  cardType,
  spottedRecords,
  targetState,
  language = 'he',
  theme = 'vintage',
  plateVisualMode = 'graphic',
  cardRef,
}) => {
  const spottedCount = Object.keys(spottedRecords).length;
  const totalCount = 50;
  const percent = Math.round((spottedCount / totalCount) * 100);
  const rank = getRankDetails(spottedCount, (language || 'he') as 'he' | 'en');

  // Theme styling (Default Vintage roadtrip aesthetic)
  const themeStyles = {
    vintage: {
      bg: 'bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/90',
      text: 'text-stone-900',
      subtext: 'text-stone-600',
      accent: 'text-orange-600',
      cardBg: 'bg-white/90 border-2 border-amber-200/80 shadow-xl backdrop-blur-xs',
      funFactBg: 'bg-amber-100/80 border border-amber-300/80 text-stone-800',
    },
    modern: {
      bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
      text: 'text-white',
      subtext: 'text-slate-300',
      accent: 'text-amber-400',
      cardBg: 'bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl',
      funFactBg: 'bg-white/10 border border-white/15 text-slate-100',
    },
    dark: {
      bg: 'bg-stone-950',
      text: 'text-stone-100',
      subtext: 'text-stone-400',
      accent: 'text-emerald-400',
      cardBg: 'bg-stone-900 border border-stone-800 shadow-2xl',
      funFactBg: 'bg-stone-900/80 border border-stone-800 text-stone-200',
    },
  }[theme];

  // Specific state record (if plate mode)
  const targetRecord = targetState ? spottedRecords[targetState.id] : null;

  return (
    <div
      ref={cardRef}
      id="shareable-graphic-card"
      className={`w-[740px] p-8 rounded-3xl ${themeStyles.bg} ${themeStyles.text} font-sans flex flex-col justify-between select-none relative overflow-hidden`}
      style={{ minHeight: cardType === 'summary' ? '560px' : '500px' }}
    >
      {/* Background ambient road-trip stamp watermark */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* HEADER ROW */}
      <div className="flex items-center justify-between z-10 border-b border-stone-900/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md text-white shrink-0">
            🇺🇸
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
              {language === 'he' ? 'משחק לוחיות הרישוי בארה״ב' : 'US License Plate Game'}
            </h2>
            <p className={`text-xs font-semibold ${themeStyles.subtext}`}>
              {language === 'he' ? 'מסע 50 המדינות 🚗' : '50 State Road Trip Hunt'}
            </p>
          </div>
        </div>

        {/* User Rank Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white font-bold shadow-xs">
          <span className="text-lg">{rank.badge}</span>
          <span className="text-xs tracking-wide">{rank.title}</span>
        </div>
      </div>

      {/* CARD CONTENT */}
      {cardType === 'summary' ? (
        <div className="flex-1 flex flex-col justify-between gap-5 z-10">
          {/* Stats Bar */}
          <div className={`p-4 rounded-2xl ${themeStyles.cardBg} flex items-center justify-around text-center`}>
            <div>
              <span className="text-3xl font-black tracking-tight text-emerald-600">
                {spottedCount}
                <span className="text-sm font-semibold opacity-60">/50</span>
              </span>
              <p className={`text-[11px] font-bold mt-0.5 ${themeStyles.subtext}`}>
                {language === 'he' ? 'מדינות שנמצאו' : 'States Spotted'}
              </p>
            </div>
            <div className="w-px h-8 bg-stone-300" />
            <div>
              <span className="text-3xl font-black tracking-tight text-amber-600">
                {percent}%
              </span>
              <p className={`text-[11px] font-bold mt-0.5 ${themeStyles.subtext}`}>
                {language === 'he' ? 'הושלמו' : 'Completed'}
              </p>
            </div>
            <div className="w-px h-8 bg-stone-300" />
            <div>
              <span className="text-3xl font-black tracking-tight text-indigo-600">
                {50 - spottedCount}
              </span>
              <p className={`text-[11px] font-bold mt-0.5 ${themeStyles.subtext}`}>
                {language === 'he' ? 'נותרו לגילוי' : 'Remaining'}
              </p>
            </div>
          </div>

          {/* Interactive Leaflet US Map matching the app screen */}
          <div className={`p-2 rounded-2xl ${themeStyles.cardBg} relative overflow-hidden border border-amber-300/80 shadow-md`}>
            <Base44MapView
              spottedRecords={spottedRecords}
              language={language}
              isStatic={true}
            />
          </div>
        </div>
      ) : (
        /* SINGLE STATE PLATE CARD */
        targetState && (
          <div className="flex-1 flex flex-col justify-between gap-4 z-10">
            <div className={`p-5 rounded-2xl ${themeStyles.cardBg} flex items-center gap-6`}>
              {/* Plate visual preview: Graphic side vs Photo side */}
              <div className="shrink-0">
                {plateVisualMode === 'photo' && targetRecord?.photoUrl ? (
                  <div className="w-56 h-32 rounded-xl overflow-hidden shadow-xl border-2 border-stone-800 relative bg-stone-900">
                    <img
                      src={targetRecord.photoUrl}
                      alt={`${targetState.name} plate photo`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>{language === 'he' ? 'צילום מסע' : 'Trip Photo'}</span>
                    </div>
                  </div>
                ) : plateVisualMode === 'photo' && !targetRecord?.photoUrl ? (
                  <div className="w-56 h-32 rounded-xl border-2 border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center p-3 text-center text-stone-500">
                    <Camera className="w-6 h-6 mb-1 text-stone-400" />
                    <span className="text-[11px] font-bold">
                      {language === 'he' ? 'אין תמונה שמורה' : 'No photo uploaded'}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {language === 'he' ? 'מוצג איור לוחית' : 'Showing artwork'}
                    </span>
                  </div>
                ) : (
                  <div className="scale-105 shadow-xl rounded-xl overflow-hidden">
                    <LicensePlateBadge
                      state={targetState}
                      isSpotted={Boolean(targetRecord)}
                      size="lg"
                    />
                  </div>
                )}
              </div>

              {/* State details */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-stone-900">
                    {language === 'he' ? targetState.nameHe : targetState.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-900 border border-amber-400/40">
                    {targetState.id}
                  </span>
                </div>
                <p className="text-xs italic font-semibold text-stone-600">
                  "{language === 'he' ? targetState.sloganHe || targetState.slogan : targetState.slogan}"
                </p>

                {/* Spotting info */}
                {targetRecord && (
                  <div className="pt-2 text-xs space-y-1 border-t border-stone-900/10">
                    {targetRecord.location && (
                      <p className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <span>📍</span>
                        <span>{targetRecord.location}</span>
                      </p>
                    )}
                    {targetRecord.spottedAt && (
                      <p className="flex items-center gap-1.5 text-stone-600 font-medium">
                        <span>📅</span>
                        <span>
                          {new Date(targetRecord.spottedAt).toLocaleDateString(
                            language === 'he' ? 'he-IL' : 'en-US',
                            { dateStyle: 'medium' }
                          )}
                        </span>
                      </p>
                    )}
                    {targetRecord.notes && (
                      <p className="text-xs italic text-stone-700 pt-1 line-clamp-2">
                        💬 "{targetRecord.notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Fun Fact snippet (Fix: uses targetState.triviaHe) */}
            <div className={`p-4 rounded-xl ${themeStyles.funFactBg} text-xs shadow-2xs`}>
              <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-1.5">
                <span>💡</span>
                <span>{language === 'he' ? 'עובדה מעניינת:' : 'Fun Fact:'}</span>
              </p>
              <p className="leading-relaxed font-medium">
                {targetState.triviaHe}
              </p>
            </div>
          </div>
        )
      )}

      {/* FOOTER WATERMARK */}
      <div className="mt-4 pt-3 border-t border-stone-900/10 flex items-center justify-between text-[11px] font-semibold text-stone-600 z-10">
        <span>plate-hunt-usa • {new Date().toLocaleDateString()}</span>
        <span className="flex items-center gap-1 font-bold text-stone-900">
          <span>{spottedCount}/50 States Unlocked</span>
          <span>🚗🇺🇸</span>
        </span>
      </div>
    </div>
  );
};
