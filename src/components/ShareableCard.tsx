import React from 'react';
import { StateInfo, SpottedRecord } from '../types';
import { US_REGIONS } from '../data/regionsData';
import { getRankDetails } from '../utils/storage';
import { LicensePlateBadge } from './LicensePlateBadge';
import { MapView } from './MapView';
import { Camera, MapPin, Calendar, Sparkles } from 'lucide-react';

interface ShareableCardProps {
  cardType: 'summary' | 'plate';
  spottedRecords: Record<string, SpottedRecord>;
  targetState?: StateInfo | null;
  language?: 'he' | 'en';
  plateVisualMode?: 'graphic' | 'photo';
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export const ShareableCard: React.FC<ShareableCardProps> = ({
  cardType,
  spottedRecords,
  targetState,
  language = 'he',
  plateVisualMode = 'graphic',
  cardRef,
}) => {
  const spottedCount = Object.keys(spottedRecords).length;
  const totalCount = 50;
  const percent = Math.round((spottedCount / totalCount) * 100);
  const rank = getRankDetails(spottedCount, (language || 'he') as 'he' | 'en');

  const targetRecord = targetState ? spottedRecords[targetState.id] : null;
  const currentRegion = targetState ? US_REGIONS[targetState.region] : null;

  return (
    <div
      ref={cardRef}
      id="shareable-graphic-card"
      className="w-[480px] p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-slate-50 to-orange-50 text-stone-900 font-sans flex flex-col justify-between select-none relative overflow-hidden shadow-2xl border-4 border-amber-200/90"
      style={{ minHeight: '760px' }}
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Background ambient lighting blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* TOP BRANDING & USER RANK HEADER */}
      <div className="flex items-center justify-between z-10 border-b border-stone-900/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-md text-white shrink-0">
            🇺🇸
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-stone-900 leading-tight">
              {language === 'he' ? 'משחק לוחיות הרישוי בארה״ב' : 'US License Plate Game'}
            </h2>
            <p className="text-xs font-semibold text-stone-500">
              {language === 'he' ? 'מסע 50 המדינות 🚗' : '50 State Road Trip Hunt'}
            </p>
          </div>
        </div>

        {/* User Rank Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-white font-bold shadow-xs shrink-0">
          <span className="text-base">{rank.badge}</span>
          <span className="text-[11px] tracking-wide">{rank.title}</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {cardType === 'summary' ? (
        <div className="flex-1 flex flex-col justify-between gap-4 z-10">
          {/* Stats Bar */}
          <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/90 shadow-md flex items-center justify-around text-center">
            <div>
              <span className="text-2xl font-black tracking-tight text-emerald-600">
                {spottedCount}
                <span className="text-xs font-semibold opacity-60">/50</span>
              </span>
              <p className="text-[10px] font-bold mt-0.5 text-stone-500">
                {language === 'he' ? 'מדינות שנמצאו' : 'States Spotted'}
              </p>
            </div>
            <div className="w-px h-7 bg-stone-300" />
            <div>
              <span className="text-2xl font-black tracking-tight text-amber-600">
                {percent}%
              </span>
              <p className="text-[10px] font-bold mt-0.5 text-stone-500">
                {language === 'he' ? 'הושלמו' : 'Completed'}
              </p>
            </div>
            <div className="w-px h-7 bg-stone-300" />
            <div>
              <span className="text-2xl font-black tracking-tight text-indigo-600">
                {50 - spottedCount}
              </span>
              <p className="text-[10px] font-bold mt-0.5 text-stone-500">
                {language === 'he' ? 'נותרו לגילוי' : 'Remaining'}
              </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="p-2 rounded-2xl bg-white/90 border border-amber-200/90 shadow-md relative overflow-hidden h-[410px]">
            <MapView
              spottedRecords={spottedRecords}
              language={language}
              isStatic={true}
            />
          </div>

          {/* Trip Progress Bar */}
          <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-300/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
              <span>{language === 'he' ? 'התקדמות הציד במסע' : 'Road Trip Progress'}</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* SINGLE STATE PLATE CARD (VERTICAL) */
        targetState && (
          <div className="flex-1 flex flex-col justify-between gap-4 z-10">
            {/* Visual Plate Header */}
            <div className="w-full flex items-center justify-center p-3 rounded-2xl bg-stone-900 shadow-xl border border-stone-800 relative min-h-[200px]">
              {plateVisualMode === 'photo' && targetRecord?.photoUrl ? (
                <div className="w-full h-48 rounded-xl overflow-hidden shadow-lg border border-stone-700 relative bg-stone-950">
                  <img
                    src={targetRecord.photoUrl}
                    alt={`${targetState.name} plate photo`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'he' ? 'צילום מסע' : 'Trip Photo'}</span>
                  </div>
                </div>
              ) : plateVisualMode === 'photo' && !targetRecord?.photoUrl ? (
                <div className="w-full h-44 rounded-xl border-2 border-dashed border-stone-700 bg-stone-800 flex flex-col items-center justify-center p-4 text-center text-stone-300">
                  <Camera className="w-8 h-8 mb-1.5 text-stone-400" />
                  <span className="text-xs font-bold">
                    {language === 'he' ? 'אין תמונה שמורה' : 'No photo uploaded'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {language === 'he' ? 'מוצג איור לוחית' : 'Showing plate artwork'}
                  </span>
                </div>
              ) : (
                <div className="transform scale-110 my-2">
                  <LicensePlateBadge
                    state={targetState}
                    isSpotted={Boolean(targetRecord)}
                    size="lg"
                  />
                </div>
              )}
            </div>

            {/* State Main Details */}
            <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/90 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                      {language === 'he' ? targetState.nameHe : targetState.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-900 border border-amber-400/40 font-mono">
                      {targetState.id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-500 mt-0.5">
                    {targetState.name} · {
                      targetState.country === 'Canada'
                        ? (language === 'he' ? '🇨🇦 קנדה (בונוס)' : '🇨🇦 Canada (Bonus)')
                        : targetState.country === 'Mexico'
                        ? (language === 'he' ? '🇲🇽 מקסיקו (בונוס)' : '🇲🇽 Mexico (Bonus)')
                        : (language === 'he' ? currentRegion?.nameHe : currentRegion?.nameEn)
                    }
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 font-semibold block">
                    {language === 'he' ? 'עיר בירה' : 'Capital'}
                  </span>
                  <span className="text-xs font-bold text-stone-700">
                    {language === 'he' ? targetState.capitalHe : targetState.capital}
                  </span>
                </div>
              </div>

              {(targetState.slogan || targetState.sloganHe) && (
                <p className="text-xs italic font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-center">
                  "{language === 'he' ? targetState.sloganHe || targetState.slogan : targetState.slogan}"
                </p>
              )}

              {/* Spotted Info (if available) */}
              {targetRecord && (
                <div className="pt-2 border-t border-stone-200 text-xs space-y-1.5">
                  {targetRecord.location && (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{targetRecord.location}</span>
                    </div>
                  )}
                  {targetRecord.spottedAt && (
                    <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {new Date(targetRecord.spottedAt).toLocaleDateString(
                          language === 'he' ? 'he-IL' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                  )}
                  {targetRecord.notes && (
                    <p className="text-xs italic text-stone-700 pt-0.5 line-clamp-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
                      💬 "{targetRecord.notes}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Fun Fact / Trivia Box */}
            <div className="p-4 rounded-2xl bg-amber-100/90 border border-amber-300 text-xs shadow-xs space-y-1">
              <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'he' ? 'הידעת?' : 'Did you know?'}</span>
              </p>
              <p className="leading-relaxed font-medium text-stone-800">
                {language === 'he' ? targetState.triviaHe : (targetState.triviaEn || targetState.triviaHe)}
              </p>
            </div>
          </div>
        )
      )}

      {/* FOOTER WATERMARK */}
      <div className="mt-4 pt-3 border-t border-stone-900/10 flex items-center justify-between text-[11px] font-semibold text-stone-500 z-10">
        <span>plate-hunt-usa · {new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span>
        <span className="flex items-center gap-1 font-extrabold text-stone-900">
          <span>{spottedCount}/50 {language === 'he' ? 'מדינות נחשפו' : 'States Unlocked'}</span>
          <span>🚗🇺🇸</span>
        </span>
      </div>
    </div>
  );
};
