import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { Sparkles, Check, Lock, Unlock, Compass, MapPin } from 'lucide-react';

interface BonusUnlockModalProps {
  type: 'canada' | 'mexico' | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'he' | 'en';
}

export const BonusUnlockModal: React.FC<BonusUnlockModalProps> = ({
  type,
  isOpen,
  onClose,
  language = 'he',
}) => {
  useEffect(() => {
    if (isOpen && type) {
      sounds.playVictorySound();
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen, type]);

  if (!isOpen || !type) return null;

  const isCanada = type === 'canada';

  return (
    <div
      id="bonus-unlock-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      dir={language === 'he' ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        id="bonus-unlock-modal-card"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden ring-1 ring-slate-200/50 my-auto text-center p-6 space-y-5 animate-scale-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background element */}
        <div
          className={`absolute -top-20 inset-x-0 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isCanada ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />

        {/* Flag Icon Header */}
        <div className="relative z-10">
          <div
            className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg border-2 ${
              isCanada
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white'
                : 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-300 text-white'
            }`}
          >
            {isCanada ? '🇨🇦' : '🇲🇽'}
          </div>
          <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isCanada
              ? language === 'he'
                ? 'בונוס 1 נפתח!'
                : 'Bonus 1 Unlocked!'
              : language === 'he'
              ? 'בונוס 2 נפתח!'
              : 'Bonus 2 Unlocked!'}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1 z-10 relative">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isCanada
              ? language === 'he'
                ? '🇨🇦 פתחתם את קנדה!'
                : '🇨🇦 Canada Provinces Unlocked!'
              : language === 'he'
              ? '🇲🇽 פתחתם את מקסיקו!'
              : '🇲🇽 Mexico License Plate Unlocked!'}
          </h2>
          <p className="text-xs font-bold text-slate-400">
            {isCanada
              ? language === 'he'
                ? 'הישג דרך: 3 מדינות בארה״ב נמצאו'
                : 'Milestone reached: 3 US States Spotted'
              : language === 'he'
              ? 'הישג דרך: 5 מדינות בארה״ב נמצאו'
              : 'Milestone reached: 5 US States Spotted'}
          </p>
        </div>

        {/* Instructions Box */}
        <div
          className={`rounded-2xl p-4 text-xs font-medium text-left leading-relaxed space-y-2.5 border shadow-inner ${
            isCanada
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          }`}
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          <div className="font-extrabold text-sm flex items-center gap-1.5 border-b border-black/10 pb-2">
            <Compass className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{language === 'he' ? '📌 הוראות אתגר הבונוס:' : '📌 Bonus Rules & Instructions:'}</span>
          </div>

          {isCanada ? (
            <div className="space-y-2">
              <p>
                {language === 'he'
                  ? 'נפתחה לכם הגישה לתעד לוחיות רישוי מ-9 הפרובינציות הקנדיות שגובלות בארה״ב:'
                  : 'You can now spot & log license plates from the 9 Canadian border provinces:'}
              </p>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 font-bold text-[11px] text-amber-900 grid grid-cols-2 gap-1 text-center">
                <span>BC · קולומביה הבריטית</span>
                <span>AB · אלברטה</span>
                <span>SK · ססקצ׳ואן</span>
                <span>MB · מניטובה</span>
                <span>ON · אונטריו</span>
                <span>QC · קוויבק</span>
                <span>NB · ניו ברונזוויק</span>
                <span>NS · נובה סקוטיה</span>
                <span className="col-span-2">YT · יוקון</span>
              </div>
              <p className="text-[11px] opacity-80 italic">
                💡 {language === 'he' ? 'הערה: הבונוס מעניק תגים ויומן תמונות נוסף ללא הפחתת אחוז ה-50 של ארה״ב.' : 'Note: Bonus items add unique badges & sightings without lowering your core 50-state progress.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                {language === 'he'
                  ? 'פתחתם את אתגר מקסיקו! במקסיקו מספיקה לוחית רישוי אחת בלבד (MX) כדי להשלים את הבונוס המקסיקני כולו.'
                  : 'Mexico bonus unlocked! Spotting just 1 Mexican license plate (MX) completes the entire Mexico bonus challenge!'}
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 font-extrabold text-xs text-emerald-900 text-center flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>MX · Mexico / מקסיקו (1/1)</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            isCanada
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{language === 'he' ? 'הבנתי, בוא נמשיך! 🚀' : "Got It, Let's Go! 🚀"}</span>
        </button>
      </div>
    </div>
  );
};
