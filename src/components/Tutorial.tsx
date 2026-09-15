import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Play } from 'lucide-react';

interface TutorialProps {
  language: 'he' | 'en';
  onFinish: () => void;
  onSkip: () => void;
  onOpenAddPlate: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({
  language,
  onFinish,
  onSkip,
  onOpenAddPlate,
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: language === 'he' ? 'ברוכים הבאים!' : 'Welcome!',
      text:
        language === 'he'
          ? 'ברוכים הבאים למשחק הדרך הכי שווה של ארצות הברית! מטרתכם היא למצוא רכבים עם לוחית רישוי מכל אחת מ-50 המדינות של ארצות הברית, במהלך שיטוטיכם בדרכים.'
          : 'Welcome to the best US road trip game! Your goal is to find license plates from all 50 US states during your travels.',
    },
    {
      title: language === 'he' ? 'מתעדים כל רגע' : 'Log every moment',
      text:
        language === 'he'
          ? 'מצאתם לוחית? תוכלו להוסיף תמונה, לציין את המיקום המדויק ולהוסיף הערה אישית על החוויה.'
          : 'Found a plate? You can add a photo, log the exact location, and add a personal note about your experience.',
    },
    {
      title: language === 'he' ? 'שתפו את האוסף!' : 'Share your collection!',
      text:
        language === 'he'
          ? 'אחרי השמירה, תקבלו כרטיס מדינה מרהיב שניתן לשתף בקלות עם חברים וברשתות החברתיות!'
          : 'After saving, you get a beautiful state card that is easy to share with friends and on social media!',
    },
    {
      title: language === 'he' ? 'מוכנים לצאת לדרך?' : 'Ready to hit the road?',
      text:
        language === 'he'
          ? 'לחצו על ה-"+" כדי לתעד את הלוחית הראשונה שלכם!'
          : 'Click the "+" button to log your first plate!',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Final step demo action: Open the Add Modal
      onOpenAddPlate();
      onFinish();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-6 my-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Skip Button */}
          <div className="flex justify-end">
            <button
              onClick={onSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {language === 'he' ? 'דלג' : 'Skip'}
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {steps[step].title}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {steps[step].text}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
          >
            {step === steps.length - 1 ? (
              <>
                <span>{language === 'he' ? 'נסה עכשיו' : 'Try it now'}</span>
                <Play className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{language === 'he' ? 'הבא' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
