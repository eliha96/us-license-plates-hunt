import React, { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { StateInfo, SpottedRecord } from '../types';
import { ShareableCard } from './ShareableCard';
import { X, Download, Share2, Copy, Check, Loader2, Image as ImageIcon, Map, RotateCcw, Camera } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  spottedRecords: Record<string, SpottedRecord>;
  targetState?: StateInfo | null;
  language?: 'he' | 'en';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  spottedRecords,
  targetState,
  language = 'he',
}) => {
  const [cardType, setCardType] = useState<'summary' | 'plate'>(targetState ? 'plate' : 'summary');
  const [plateVisualMode, setPlateVisualMode] = useState<'graphic' | 'photo'>('graphic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const hiddenCardRef = useRef<HTMLDivElement | null>(null);

  // Sync default card type and photo visual mode when opening modal or selecting state
  useEffect(() => {
    if (targetState) {
      setCardType('plate');
      const hasPhoto = Boolean(spottedRecords[targetState.id]?.photoUrl);
      setPlateVisualMode(hasPhoto ? 'photo' : 'graphic');
    } else {
      setCardType('summary');
      setPlateVisualMode('graphic');
    }
  }, [targetState, isOpen, spottedRecords]);

  if (!isOpen) return null;

  const generatePngBlob = async (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    if (!hiddenCardRef.current) return null;
    try {
      const dataUrl = await htmlToImage.toPng(hiddenCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return { blob, dataUrl };
    } catch (err) {
      console.error('Failed to generate card image', err);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePngBlob();
      if (!result) throw new Error('Image generation failed');

      const fileName =
        cardType === 'summary'
          ? `plate-hunt-progress-${new Date().toISOString().slice(0, 10)}.png`
          : `plate-hunt-${targetState?.id || 'plate'}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = result.dataUrl;
      link.click();
    } catch (err) {
      alert(language === 'he' ? 'חלה שגיאה ביצירת התמונה' : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePngBlob();
      if (!result) throw new Error('Image generation failed');

      const fileName =
        cardType === 'summary'
          ? 'plate-hunt-progress.png'
          : `plate-hunt-${targetState?.id || 'plate'}.png`;

      const file = new File([result.blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: language === 'he' ? 'ציד לוחיות הרישוי שלי 🚗🇺🇸' : 'My US License Plate Hunt',
          text:
            language === 'he'
              ? `צפו בהתקדמות ציד לוחיות הרישוי שלי בארה״ב! 🚗🇺🇸`
              : `Check out my US License Plate Hunt progress! 🚗🇺🇸`,
        });
      } else if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': result.blob }),
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 3000);
      } else {
        handleDownload();
      }
    } catch (err) {
      // User cancelled share or browser error
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="share-graphic-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Off-screen actual high-res rendering node */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none">
        <ShareableCard
          cardRef={hiddenCardRef}
          cardType={cardType}
          spottedRecords={spottedRecords}
          targetState={targetState}
          language={language}
          plateVisualMode={plateVisualMode}
        />
      </div>

      {/* Modal Dialog Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col my-auto max-h-[90vh]" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {language === 'he' ? 'שיתוף כרטיס תמונה' : 'Share Graphic Card'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'he'
                  ? 'ייצא כרטיס תמונה לאורך, מותאם לשיתוף בנייד'
                  : 'Export a vertical image card tailored for mobile sharing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Controls & Preview */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Card Type Switcher & Flip Control */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {targetState ? (
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCardType('summary')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    cardType === 'summary'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>{language === 'he' ? 'מפת התקדמות' : 'Progress Map'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('plate')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    cardType === 'plate'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>
                    {language === 'he'
                      ? `לוחית ${targetState.nameHe}`
                      : `${targetState.id} Plate`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5">
                <Map className="w-4 h-4 text-orange-600" />
                <span>{language === 'he' ? 'תצוגת מפת מסע' : 'Trip Map Progress'}</span>
              </div>
            )}

            {/* Interactive Flip Toggle (Photo vs Artwork for Plate Share) */}
            {cardType === 'plate' && (
              <button
                type="button"
                onClick={() =>
                  setPlateVisualMode((prev) => (prev === 'graphic' ? 'photo' : 'graphic'))
                }
                className="px-3 py-1.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-200 transition-all shadow-2xs active:scale-95 ml-auto"
                title="Toggle Photo / Plate Artwork"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {plateVisualMode === 'graphic'
                    ? language === 'he'
                      ? 'החלף לצילום 📸'
                      : 'Show Photo 📸'
                    : language === 'he'
                    ? 'החלף לאיור 🎨'
                    : 'Show Plate 🎨'}
                </span>
              </button>
            )}
          </div>

          {/* Helper hint for summary map positioning */}
          {cardType === 'summary' && (
            <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span>💡</span>
              <span>
                {language === 'he'
                  ? 'ניתן להגדיל ולגרור את המפה לקבלת הזווית המועדפת עליך!'
                  : 'Drag and zoom the map to position your preferred view before downloading!'}
              </span>
            </div>
          )}

          {/* Scaled Vertical Card Preview Box */}
          <div className="rounded-2xl bg-stone-900 p-3 flex flex-col items-center justify-center overflow-hidden border border-stone-800 relative min-h-[380px]">
            <div className="w-full flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
              <span>{language === 'he' ? 'תצוגה מקדימה לאורך:' : 'Vertical Card Preview:'}</span>
              <span className="text-amber-400">Mobile Portrait 📱🚗</span>
            </div>

            <div className="w-full flex items-center justify-center overflow-hidden rounded-xl py-2">
              <div className="transform scale-[0.45] sm:scale-[0.52] origin-top -mb-[330px] sm:-mb-[280px]">
                <ShareableCard
                  cardType={cardType}
                  spottedRecords={spottedRecords}
                  targetState={targetState}
                  language={language}
                  plateVisualMode={plateVisualMode}
                />
              </div>
            </div>
          </div>

          {/* Success Notification Toast */}
          {copiedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'he'
                  ? 'התמונה הועתקה ללוח! 📋'
                  : 'Image copied to clipboard! 📋'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            {language === 'he' ? 'סגור' : 'Close'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-2xs active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <Download className="w-4 h-4 text-amber-600" />
            )}
            <span>{language === 'he' ? 'הורד תמונה (PNG)' : 'Download Image'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span>{language === 'he' ? 'שתף תמונה' : 'Share Graphic'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
