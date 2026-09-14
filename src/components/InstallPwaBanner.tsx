import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPwaBannerProps {
  language?: 'he' | 'en';
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ language = 'he' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('plate_hunt_install_banner_dismissed_v3'));
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

    // Check global pre-captured prompt
    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPwaPrompt = e;
    };

    const handleCaptured = () => {
      if ((window as any).deferredPwaPrompt) {
        setDeferredPrompt((window as any).deferredPwaPrompt);
      }
    };

    // Header download button click listener
    const handleOpenInstall = () => {
      triggerInstall();
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
      setIsBannerDismissed(true);
      localStorage.setItem('plate_hunt_install_banner_dismissed_v3', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-captured', handleCaptured);
    window.addEventListener('open-pwa-install-modal', handleOpenInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-captured', handleCaptured);
      window.removeEventListener('open-pwa-install-modal', handleOpenInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    const activePrompt = deferredPrompt || (window as any).deferredPwaPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        setDeferredPrompt(null);
        (window as any).deferredPwaPrompt = null;

        if (choice && choice.outcome === 'accepted') {
          handleDismissBanner();
          setIsModalOpen(false);
        }
        // User interacted with native prompt - do not open instruction modal on cancel!
        return;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    // If native prompt is not available (e.g. iOS or unsupported browser), show step-by-step modal
    setIsModalOpen(true);
  };

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    localStorage.setItem('plate_hunt_install_banner_dismissed_v3', 'true');
  };

  if (isStandalone) return null;

  const activePrompt = deferredPrompt || (window as any).deferredPwaPrompt;

  return (
    <>
      {/* Bottom Sticky PWA Banner (Shows if not dismissed) */}
      {!isBannerDismissed && (
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
                  {language === 'he' ? 'הורד את האפליקציה למכשיר' : 'Download App to Device'}
                </h4>
                <p className="text-[11px] text-slate-300 truncate">
                  {language === 'he'
                    ? 'לגישה מהירה במסך הבית ללא סרגל דפדפן!'
                    : 'Quick home screen access with no browser bar!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={triggerInstall}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>{language === 'he' ? 'הורד עכשיו' : 'Download'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Installation Instructions & Action Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          dir={language === 'he' ? 'rtl' : 'ltr'}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-md border border-slate-200 p-0.5 bg-slate-50">
              <img src="/app-icon.png" alt="App Icon" className="w-full h-full object-cover rounded-xl" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {language === 'he' ? 'שמירת האפליקציה במסך הבית' : 'Add App to Home Screen'}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {language === 'he'
                  ? 'השתמשו באפליקציה כמו אפליקציה מובנית במכשיר (PWA)'
                  : 'Use like a native app on your phone or desktop'}
              </p>
            </div>

            {/* Direct Native Install Button if browser supports prompt */}
            {activePrompt ? (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <p className="text-xs font-bold text-amber-900">
                  {language === 'he' ? '⚡ התקנה בלחיצה אחת זמינה בדפדפן זה!' : '⚡ 1-Click Install Available!'}
                </p>
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'he' ? 'התקן עכשיו למכשיר' : 'Install App Now'}</span>
                </button>
              </div>
            ) : isIOS ? (
              /* iOS Safari Steps */
              <div className="space-y-2.5 text-start text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <span>
                    {language === 'he'
                      ? 'לחץ על כפתור השיתוף בתחתית המסך ב-Safari 📤'
                      : 'Tap Share at the bottom of Safari 📤'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <span>
                    {language === 'he'
                      ? 'גלול ובחר "הוסף למסך הבית" ➕'
                      : 'Scroll and tap "Add to Home Screen" ➕'}
                  </span>
                </div>
              </div>
            ) : (
              /* Android / Desktop Chrome / General browser steps */
              <div className="space-y-2.5 text-start text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <span>
                    {language === 'he'
                      ? 'לחץ על 3 הנקודות (⋮) או אייקון ההתקנה 📥 בסרגל הכתובות'
                      : 'Tap menu (⋮) or install icon 📥 in address bar'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <span>
                    {language === 'he'
                      ? 'בחר "התקן אפליקציה" או "שמירה במסך הבית"'
                      : 'Select "Install App" or "Add to Home Screen"'}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              {language === 'he' ? 'סגור' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
