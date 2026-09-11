import React, { useState, useEffect } from 'react';
import { StateInfo, SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
import { US_REGIONS } from '../data/regionsData';
import {
  X,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  Upload,
  Navigation,
  Loader2,
  Search,
} from 'lucide-react';

interface AddPlateModalProps {
  initialState: StateInfo | null;
  existingRecord?: SpottedRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: SpottedRecord) => void;
  onDelete?: (stateId: string) => void;
  language?: 'he' | 'en';
}

export const AddPlateModal: React.FC<AddPlateModalProps> = ({
  initialState,
  existingRecord,
  isOpen,
  onClose,
  onSave,
  onDelete,
  language = 'he',
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(initialState?.id || 'CA');
  const [location, setLocation] = useState<string>('');
  const [spottedAt, setSpottedAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');
  const [stateSearch, setStateSearch] = useState<string>('');

  useEffect(() => {
    if (initialState) {
      setSelectedStateId(initialState.id);
    }
  }, [initialState]);

  useEffect(() => {
    if (existingRecord) {
      setSelectedStateId(existingRecord.stateId);
      setLocation(existingRecord.location || '');
      setSpottedAt(existingRecord.spottedAt ? existingRecord.spottedAt.slice(0, 16) : '');
      setNotes(existingRecord.notes || '');
      setPhotoUrl(existingRecord.photoUrl || '');
      setLat(existingRecord.latitude);
      setLng(existingRecord.longitude);
    } else {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setSpottedAt(localIso);
      setLocation('');
      setNotes('');
      setPhotoUrl('');
      setLat(undefined);
      setLng(undefined);
    }
    setLocationError('');
    setStateSearch('');
  }, [existingRecord, isOpen]);

  if (!isOpen) return null;

  const currentState = STATES_DATA[selectedStateId] || initialState || STATES_DATA['CA'];
  const currentRegion = US_REGIONS[currentState.region];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'he' ? 'גודל הקובץ גדול מ-5MB' : 'File size exceeds 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        language === 'he'
          ? 'שירותי מיקום אינם נתמכים בדפדפן זה'
          : 'Geolocation is not supported by your browser'
      );
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingLocation(false);
        const latitude = parseFloat(pos.coords.latitude.toFixed(4));
        const longitude = parseFloat(pos.coords.longitude.toFixed(4));
        setLat(latitude);
        setLng(longitude);
        const autoLoc = `${latitude}, ${longitude}`;
        setLocation((prev) => (prev ? `${prev} (${autoLoc})` : autoLoc));
      },
      () => {
        setIsGettingLocation(false);
        setLocationError(
          language === 'he'
            ? 'לא הצלחנו לקבל מיקום GPS (בדקו הרשאות מיקום)'
            : 'Could not retrieve GPS location'
        );
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: SpottedRecord = {
      stateId: selectedStateId,
      spottedAt: spottedAt ? new Date(spottedAt).toISOString() : new Date().toISOString(),
      location: location.trim(),
      latitude: lat,
      longitude: lng,
      notes: notes.trim(),
      photoUrl: photoUrl || undefined,
    };
    onSave(record);
  };

  const filteredStatesList = Object.values(STATES_DATA).filter((s) => {
    if (!stateSearch.trim()) return true;
    const q = stateSearch.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameHe.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="add-plate-modal-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="add-plate-modal-card"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden ring-1 ring-slate-200 my-auto text-left"
        dir={language === 'he' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-white text-base shadow-inner">
              {currentState.id}
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-extrabold text-white leading-tight">
                {existingRecord
                  ? language === 'he'
                    ? `עריכת תיעוד - ${currentState.nameHe}`
                    : `Edit Sighting - ${currentState.name}`
                  : language === 'he'
                  ? `הוספת תגלית - ${currentState.nameHe}`
                  : `Add Discovery - ${currentState.name}`}
              </h2>
              <p className="text-xs text-indigo-100">
                {language === 'he'
                  ? 'תעדו לוחית רישוי חדשה במסע שלכם'
                  : 'Log a new license plate discovery'}
              </p>
            </div>
          </div>
          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* State Selector with Search */}
          <div>
            <label
              htmlFor="state-select"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              {language === 'he' ? 'בחירת מדינה (State)' : 'Select State'}
            </label>
            <select
              id="state-select"
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className="w-full px-3.5 py-3 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
            >
              {Object.values(STATES_DATA).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} - {language === 'he' ? `${s.nameHe} (${s.name})` : `${s.name} (${s.nameHe})`}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Capture & Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Camera className="w-4 h-4 text-indigo-500" />
                {language === 'he' ? 'תמונת הלוחית מהדרך' : 'License Plate Photo'}
              </span>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  {language === 'he' ? 'הסר תמונה' : 'Remove'}
                </button>
              )}
            </label>

            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-40 bg-slate-100 shadow-inner">
                <img
                  src={photoUrl}
                  alt="Uploaded plate"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <label
                htmlFor="plate-photo-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl p-4 cursor-pointer transition-all min-h-[90px]"
              >
                <Camera className="w-6 h-6 text-indigo-500 mb-1" />
                <span className="text-xs font-bold text-slate-700">
                  {language === 'he' ? 'צלם במצלמה או העלה תמונה' : 'Take a photo or upload file'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  JPG, PNG, WebP
                </span>
                <input
                  id="plate-photo-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label
              htmlFor="spotted-at-input"
              className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              {language === 'he' ? 'תאריך ושעת התצפית' : 'Date & Time Spotted'}
            </label>
            <input
              id="spotted-at-input"
              type="datetime-local"
              value={spottedAt}
              onChange={(e) => setSpottedAt(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="location-input"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                {language === 'he' ? 'איפה ראית אותה?' : 'Where did you spot it?'}
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 cursor-pointer"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                {language === 'he' ? 'קבל GPS נוכחי' : 'Use Current GPS'}
              </button>
            </div>
            <input
              id="location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={
                language === 'he'
                  ? 'כביש 66 ליד סליגמן / חניון בפארק יוטה'
                  : 'Route 66 near Flagstaff / Highway rest area'
              }
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {locationError && (
              <p className="text-xs text-rose-500 mt-1">{locationError}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes-input"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              {language === 'he' ? 'הערה מהנסיעה' : 'Note'}
            </label>
            <textarea
              id="notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === 'he'
                  ? 'איזה רכב זה היה? מי ראה ראשון? זיכרון מהדרך...'
                  : 'What kind of car? Who spotted it first?'
              }
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
            {existingRecord && onDelete ? (
              <button
                id="btn-delete-plate"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      language === 'he'
                        ? 'האם למחוק את תיעוד הלוחית?'
                        : 'Delete this sighting?'
                    )
                  ) {
                    onDelete(selectedStateId);
                    onClose();
                  }
                }}
                className="h-11 px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                {language === 'he' ? 'מחק' : 'Delete'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                id="btn-cancel-modal"
                type="button"
                onClick={onClose}
                className="h-11 px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                id="btn-save-plate-submit"
                type="submit"
                className="h-11 px-6 py-2 text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {existingRecord
                  ? language === 'he'
                    ? 'עדכן פרטים'
                    : 'Save changes'
                  : language === 'he'
                  ? 'שמור תגלית!'
                  : 'Save discovery!'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
