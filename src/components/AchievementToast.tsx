import React from 'react';
import { Achievement } from '../types';
import { Trophy, Sparkles, X } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  language?: 'he' | 'en';
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  language = 'he',
}) => {
  if (!achievement) return null;

  return (
    <div
      id="achievement-toast-banner"
      className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400 z-50 flex items-center justify-between gap-3 animate-bounce"
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
          🏆
        </div>
        <div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'he' ? 'הישג חדש נפתח!' : 'New Badge Unlocked!'}</span>
          </div>
          <h4 className="font-black text-sm text-white">
            {language === 'he' ? achievement.titleHe : achievement.titleEn}
          </h4>
          <p className="text-xs text-stone-300">
            {language === 'he' ? achievement.descriptionHe : achievement.descriptionEn}
          </p>
        </div>
      </div>

      <button
        id="btn-dismiss-toast"
        type="button"
        onClick={onDismiss}
        className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
