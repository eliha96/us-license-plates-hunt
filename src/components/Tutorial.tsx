import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TutorialProps {
  language: 'he' | 'en';
  onFinish: () => void;
  onSkip: () => void;
  onOpenAddPlate: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

export const Tutorial: React.FC<TutorialProps> = ({
  language,
  onFinish,
  onSkip,
  onOpenAddPlate,
}) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const isRtl = language === 'he';

  const steps = [
    {
      targetKey: 'hero-progress',
      title: language === 'he' ? 'ברוכים הבאים למשחק הציד! 🚗' : 'Welcome to the Hunt! 🚗',
      text:
        language === 'he'
          ? 'מטרתכם היא למצוא ולתעד רכבים עם לוחיות רישוי מכל 50 המדינות בארה"ב במהלך שיטוטיכם בדרכים. כאן תראו את מד ההתקדמות בזמן אמת!'
          : 'Your goal is to spot and log license plates from all 50 US states on your travels. Track your real-time progress right here!',
      padding: 6,
      borderRadius: 24,
    },
    {
      targetKey: 'add-btn',
      title: language === 'he' ? 'מתעדים כל לוחית בלחיצה 📸' : 'Log Every Plate with a Tap 📸',
      text:
        language === 'he'
          ? 'מצאתם לוחית חדשה בכביש? לחצו על כפתור הפלוס (+) כדי לצלם אותה, לשמור את המיקום המדויק ולהוסיף הערה אישית למזכרת.'
          : 'Spotted a new plate on the road? Tap the plus (+) button to snap a photo, save exact location, and write notes.',
      padding: 10,
      borderRadius: 9999,
    },
    {
      targetKey: 'nav-tabs',
      title: language === 'he' ? 'גלריית תמונות, מפה ותגים 🏆' : 'Gallery, Travel Map & Badges 🏆',
      text:
        language === 'he'
          ? 'עברו בין הטאבים בתחתית המסך כדי לראות את כרטיסי הלוחיות שאספתם, לבחון את מפת המסע ולפתוח תגי הישג ייחודיים!'
          : 'Switch between bottom tabs to view your collected state cards, inspect your travel map, and unlock achievement badges!',
      padding: 6,
      borderRadius: 20,
    },
    {
      targetKey: null, // Centered grand finale
      title: language === 'he' ? 'מוכנים לצאת לדרך? 🏁' : 'Ready to Hit the Road? 🏁',
      text:
        language === 'he'
          ? 'לחצו "היכון, הכן, סע!" כדי לצאת לדרך ולהתחיל במסע הציד האולטימטיבי!'
          : 'Click "Ready, set, go!" to begin your ultimate road trip adventure!',
      padding: 0,
      borderRadius: 0,
    },
  ];

  const currentStepData = steps[step];

  // Measure target DOM rect
  useEffect(() => {
    const updateTargetRect = () => {
      const targetKey = currentStepData.targetKey;
      if (!targetKey) {
        setTargetRect(null);
        return;
      }

      const el = document.querySelector(`[data-tour-target="${targetKey}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: currentStepData.borderRadius,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    const timer = setTimeout(updateTargetRect, 100);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      clearTimeout(timer);
    };
  }, [step, currentStepData]);

  const handleNext = () => {
    sounds.playTapSound();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    sounds.playTapSound();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    sounds.playVictorySound();
    try {
      confetti({
        particleCount: 85,
        spread: 85,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
    onFinish();
  };

  const pad = currentStepData.padding;

  // Determine Tooltip Placement (above or below target)
  const isTopPositioned = targetRect && targetRect.top > window.innerHeight / 2;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-hidden select-none"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* SVG Spotlight Mask Cutout Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <mask id="tour-spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <motion.rect
                  initial={false}
                  animate={{
                    x: targetRect.left - pad,
                    y: targetRect.top - pad,
                    width: targetRect.width + pad * 2,
                    height: targetRect.height + pad * 2,
                    rx: targetRect.borderRadius,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.78)"
            mask="url(#tour-spotlight-mask)"
            className="backdrop-blur-[3px]"
          />
        </svg>

        {/* Animated Glow Ring around target element */}
        {targetRect && (
          <motion.div
            initial={false}
            animate={{
              top: targetRect.top - pad,
              left: targetRect.left - pad,
              width: targetRect.width + pad * 2,
              height: targetRect.height + pad * 2,
              borderRadius: targetRect.borderRadius,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed pointer-events-auto z-20 border-2 border-indigo-400/90 shadow-[0_0_25px_rgba(99,102,241,0.6)] cursor-pointer group"
            onClick={() => {
              handleNext();
            }}
          />
        )}

        {/* Floating Tooltip Box */}
        <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-center items-center p-4">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: targetRect ? 'absolute' : 'relative',
              ...(targetRect
                ? isTopPositioned
                  ? { bottom: window.innerHeight - targetRect.top + pad + 16 }
                  : { top: targetRect.top + targetRect.height + pad + 16 }
                : {}),
            }}
            className="pointer-events-auto bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 shadow-indigo-950/20"
          >
            {/* Step Progress Dots & Skip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === step
                        ? 'w-6 bg-indigo-600'
                        : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-extrabold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                {language === 'he' ? 'דלג' : 'Skip'}
              </button>
            </div>

            {/* Title & Body */}
            <div className="space-y-2 text-start pt-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{currentStepData.title}</span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {currentStepData.text}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="py-3 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{language === 'he' ? 'הקודם' : 'Back'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                {step === steps.length - 1 ? (
                  <>
                    <span>{language === 'he' ? 'היכון, הכן, סע! 🚀' : 'Ready, set, go! 🚀'}</span>
                    <Play className="w-4 h-4 fill-current" />
                  </>
                ) : (
                  <>
                    <span>{language === 'he' ? 'הבא' : 'Next'}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
