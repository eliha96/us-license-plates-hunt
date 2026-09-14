import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPwaBannerProps {
  language?: 'he' | 'en';
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ language = 'he' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const inStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(inStandaloneMode);

    // Check if user previously dismissed banner
    const dismissed = localStorage.getItem('plate_hunt_install_banner_dismissed_v2');
    if (dismissed || inStandaloneMode) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Show banner on first visit if not dismissed & not standalone
    setIsDismissed(false);

    // Capture Chrome / Android / Desktop PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Custom Android / Chrome instructions modal (No alert popup!)
      setShowAndroidInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('plate_hunt_install_banner_dismissed_v2', 'true');
  };

  if (isStandalone || isDismissed) return null;

  return (
    <>
      {/* Bottom PWA Banner (First visit only) */}
      <div
        id="pwa-install-banner"
        className="fixed bottom-20 inset-x-3 z-40 max-w-md mx-auto animate-fade-in"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 shadow-2xl text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-700">
              <img src="/app-icon.png" alt="App Icon" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                {language === 'he' ? 'הוסף את האפליקציה למסך הבית' : 'Add App to Home Screen'}
              </h4>
              <p className="text-[11px] text-slate-300 truncate">
                {language === 'he'
                  ? 'לגישה מהירה בדרכים ללא סרגל דפדפן!'
                  : 'Quick road trip access right from your phone!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'he' ? 'התקן' : 'Install'}</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          dir={language === 'he' ? 'rtl' : 'ltr'}
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-200 text-center space-y-4 my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-md border border-slate-200">
              <img src="/app-icon.png" alt="App Icon" className="w-full h-full object-cover" />
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

            <div className="space-y-2.5 text-right text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
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
              onClick={() => {
                setShowIOSInstructions(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              {language === 'he' ? 'הבנתי, תודה!' : 'Got it!'}
            </button>
          </div>
        </div>
      )}

      {/* Android / Chrome Instructions Modal (Replaces browser alert) */}
      {showAndroidInstructions && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          dir={language === 'he' ? 'rtl' : 'ltr'}
          onClick={() => setShowAndroidInstructions(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-200 text-center space-y-4 my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-md border border-slate-200">
              <img src="/app-icon.png" alt="App Icon" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {language === 'he' ? 'הוספה למסך הבית' : 'Add to Home Screen'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'he'
                  ? 'עקוב אחר 2 הצעדים הבאים בדפדפן:'
                  : 'Follow these 2 steps in your browser:'}
              </p>
            </div>

            <div className="space-y-2.5 text-right text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  1
                </span>
                <span>
                  {language === 'he'
                    ? 'לחץ על 3 הנקודות (⋮) בראש הדפדפן'
                    : 'Tap the 3 dots (⋮) at top right'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  2
                </span>
                <span>
                  {language === 'he'
                    ? 'בחר "הוסף למסך הבית" או "התקן אפליקציה"'
                    : 'Select "Add to Home Screen" or "Install App"'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAndroidInstructions(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              {language === 'he' ? 'הבנתי, תודה!' : 'Got it, thanks!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};


