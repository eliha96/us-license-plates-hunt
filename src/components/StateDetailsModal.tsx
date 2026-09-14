import React from 'react';
import { StateInfo, SpottedRecord } from '../types';
import { US_REGIONS } from '../data/regionsData';
import {
  X,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Lock,
  Plus,
  Share2,
} from 'lucide-react';

interface StateDetailsModalProps {
  state: StateInfo | null;
  record?: SpottedRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (state: StateInfo) => void;
  onLogNew: (state: StateInfo) => void;
  onShare?: (state: StateInfo) => void;
  language?: 'he' | 'en';
}

const REGION_COLORS: Record<string, string> = {
  West: '#f59e0b',
  Midwest: '#10b981',
  South: '#ef4444',
  Northeast: '#6366f1',
};

export const StateDetailsModal: React.FC<StateDetailsModalProps> = ({
  state,
  record,
  isOpen,
  onClose,
  onEdit,
  onLogNew,
  onShare,
  language = 'he',
}) => {
  if (!isOpen || !state) return null;

  const isSpotted = Boolean(record);
  const currentRegion = US_REGIONS[state.region];

  const formattedDate = record?.spottedAt
    ? new Date(record.spottedAt).toLocaleDateString(
        language === 'he' ? 'he-IL' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    : '';

  return (
    <div
      id="state-details-modal-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="state-details-modal-card"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden ring-1 ring-slate-200 my-auto text-start"
        dir={language === 'he' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Gradient */}
        <div
          className={`p-5 relative ${
            isSpotted
              ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="state-detail-title"
                  className={`text-2xl font-extrabold ${
                    isSpotted ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {language === 'he' ? state.nameHe : state.name}
                </h2>
                <span
                  className={`text-sm font-bold opacity-80 ${
                    isSpotted ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  ({state.id})
                </span>
              </div>
              <p
                className={`text-xs font-semibold mt-1 flex items-center gap-1.5 ${
                  isSpotted ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                <span>{state.name}</span>
                <span>·</span>
                <span>
                  {state.country === 'Canada'
                    ? language === 'he'
                      ? '🇨🇦 קנדה (בונוס)'
                      : '🇨🇦 Canada (Bonus)'
                    : state.country === 'Mexico'
                    ? language === 'he'
                      ? '🇲🇽 מקסיקו (בונוס)'
                      : '🇲🇽 Mexico (Bonus)'
                    : language === 'he'
                    ? currentRegion?.nameHe
                    : currentRegion?.nameEn}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isSpotted ? (
                <span className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-2xs">
                  <CheckCircle2 className="h-4 w-4" />
                  {language === 'he' ? 'נמצאה' : 'Discovered'}
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600 shadow-2xs">
                  <Lock className="h-3.5 w-3.5" />
                  {language === 'he' ? 'נעולה' : 'Locked'}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors ${
                  isSpotted
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Photo or State Plate Graphic */}
          <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-slate-100 shadow-inner">
            {record?.photoUrl ? (
              <img
                src={record.photoUrl}
                alt={state.name}
                className="w-full h-44 object-cover"
              />
            ) : (
              /* Authentic American License Plate Graphic */
              <div className="p-3 bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center">
                <div
                  className="w-full max-w-sm rounded-xl p-3 sm:p-4 border-4 relative shadow-md flex flex-col items-center justify-between text-center overflow-hidden"
                  style={{
                    backgroundColor: state.plateDesign?.bg || '#ffffff',
                    borderColor: state.plateDesign?.border || REGION_COLORS[state.region] || '#4f46e5',
                    color: state.plateDesign?.text || '#1e293b',
                    minHeight: '140px',
                  }}
                >
                  {/* Four Plate Bolt Holes */}
                  <div className="absolute top-2 left-3 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner" />
                  <div className="absolute top-2 right-3 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner" />
                  <div className="absolute bottom-2 left-3 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner" />
                  <div className="absolute bottom-2 right-3 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner" />

                  {/* Top State Banner */}
                  <div className="w-full flex items-center justify-between px-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                      {state.region.toUpperCase()}
                    </span>
                    <span
                      className="text-sm font-black tracking-widest uppercase font-mono"
                      style={{ color: state.plateDesign?.accent || REGION_COLORS[state.region] }}
                    >
                      {state.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 shadow-2xs">
                      2026
                    </span>
                  </div>

                  {/* Center Plate Number & Abbreviation */}
                  <div className="my-1.5 flex items-center justify-center gap-2">
                    <span
                      className="text-4xl sm:text-5xl font-black tracking-widest font-mono drop-shadow-xs"
                      style={{
                        letterSpacing: '0.12em',
                        color: state.plateDesign?.text || '#0f172a',
                      }}
                    >
                      {state.samplePlateNumber || `${state.id} · 50`}
                    </span>
                  </div>

                  {/* Bottom State Slogan */}
                  <div className="w-full text-center px-2">
                    {state.slogan && (
                      <p className="text-[11px] font-semibold italic tracking-tight opacity-90 truncate">
                        “{state.slogan}”
                      </p>
                    )}
                    {language === 'he' && state.sloganHe && (
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {state.sloganHe}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sighting Details if discovered */}
          {isSpotted && record && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{language === 'he' ? 'זמן גילוי' : 'Discovered'}</span>
                </div>
                <div className="font-bold text-slate-700 text-xs mt-1">
                  {formattedDate}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{language === 'he' ? 'מיקום' : 'Location'}</span>
                </div>
                <div className="font-bold text-slate-700 text-xs mt-1 truncate">
                  {record.location || (language === 'he' ? 'לא צוין' : 'Not recorded')}
                </div>
              </div>
            </div>
          )}

          {record?.notes && (
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
              <div className="text-xs font-bold text-slate-400">
                {language === 'he' ? 'הערות מהמסע' : 'Trip Note'}
              </div>
              <p className="text-xs text-slate-700 mt-1 italic">
                “{record.notes}”
              </p>
            </div>
          )}

          {/* State Facts */}
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">
                {language === 'he' ? 'עיר בירה' : 'State Capital'}:
              </span>
              <span className="font-bold text-slate-700">
                {language === 'he' ? state.capitalHe : state.capital}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">
                {language === 'he' ? 'אזור / מדינה' : 'Region / Country'}:
              </span>
              <span className="font-bold text-slate-700">
                {state.country === 'Canada'
                  ? language === 'he'
                    ? '🇨🇦 קנדה (בונוס)'
                    : '🇨🇦 Canada (Bonus)'
                  : state.country === 'Mexico'
                  ? language === 'he'
                    ? '🇲🇽 מקסיקו (בונוס)'
                    : '🇲🇽 Mexico (Bonus)'
                  : language === 'he'
                  ? currentRegion?.nameHe
                  : currentRegion?.nameEn}
              </span>
            </div>
            {(state.triviaHe || state.triviaEn) && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block mb-0.5">
                  💡 {language === 'he' ? 'הידעת?' : 'Did you know?'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {language === 'he' ? state.triviaHe : (state.triviaEn || state.triviaHe)}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(state)}
                title={language === 'he' ? 'שתף כרטיס מעוצב' : 'Share Graphic Card'}
                className="py-3 px-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm border border-indigo-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>{language === 'he' ? 'שתף תמונה' : 'Share Card'}</span>
              </button>
            )}

            {isSpotted ? (
              <button
                type="button"
                onClick={() => onEdit(state)}
                className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                {language === 'he' ? 'ערוך פרטי תיעוד' : 'Edit Sighting'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLogNew(state)}
                className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                {language === 'he' ? 'סמן כנמצאה!' : 'Add Discovery!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
