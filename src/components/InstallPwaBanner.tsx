import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

interface InstallPwaBannerProps {
  language?: 'he' | 'en';
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ language = 'he' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const inStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(inStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome / Android / Desktop PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen to header button trigger
    const handleOpenInstall = () => {
      setIsDismissed(false);
      handleInstallClick();
    };

    window.addEventListener('open-pwa-install-modal', handleOpenInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install-modal', handleOpenInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Fallback instructions
      alert(
        language === 'he'
          ? 'כדי להוסיף למסך הבית: לחץ על תפריט הדפדפן (3 נקודות) ובחר "הוסף למסך הבית"'
          : 'To install: open browser menu and select "Add to Home Screen"'
      );
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Top of Page Install Banner */}
      {!isDismissed && (
        <div
          id="pwa-install-banner-top"
          className="sticky top-0 z-40 w-full animate-fade-in"
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-950 border-b border-amber-500/30 p-2.5 sm:p-3 shadow-md text-white flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base shadow-xs shrink-0">
                📲
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-white truncate">
                  {language === 'he' ? 'הוסף את האפליקציה למסך הבית' : 'Add App to Home Screen'}
                </h4>
                <p className="text-[10px] text-amber-200/90 truncate">
                  {language === 'he'
                    ? 'לגישה מהירה בדרכים בלחיצה אחת'
                    : 'Quick 1-tap access on your phone'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'he' ? 'התקן' : 'Install'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          dir={language === 'he' ? 'rtl' : 'ltr'}
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-200 text-center space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl">
              📲
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {language === 'he' ? 'הוספה למסך הבית ב-iPhone' : 'Add to iPhone Home Screen'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'he'
                  ? 'עקוב אחר 2 הצעדים הפשוטים הבאים ב-Safari:'
                  : 'Follow these 2 steps in Safari:'}
              </p>
            </div>

            <div className="space-y-2.5 text-left text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  1
                </span>
                <span>
                  {language === 'he'
                    ? 'לחץ על כפתור השיתוף בתחתית המסך 📤'
                    : 'Tap the Share button at the bottom 📤'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  2
                </span>
                <span>
                  {language === 'he'
                    ? 'גלול ובחר "הוסף למסך הבית" ➕'
                    : 'Scroll and select "Add to Home Screen" ➕'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              {language === 'he' ? 'הבנתי, תודה!' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

