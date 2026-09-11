import React from 'react';
import { SpottedRecord, StateInfo } from '../types';
import { STATES_DATA } from '../data/statesData';
import { ALL_BONUS_DATA } from '../data/bonusData';
import { SightingsMapView } from './SightingsMapView';
import { MapPin, Calendar, Camera, Edit3, Trash2 } from 'lucide-react';

const ALL_COMBINED_STATES: Record<string, StateInfo> = {
  ...STATES_DATA,
  ...ALL_BONUS_DATA,
};

interface SightingsPageViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectRecord: (record: SpottedRecord) => void;
  onEditRecord: (record: SpottedRecord) => void;
  onDeleteRecord: (stateId: string) => void;
  onAddDiscovery: () => void;
  language?: 'he' | 'en';
}

export const SightingsPageView: React.FC<SightingsPageViewProps> = ({
  spottedRecords,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onAddDiscovery,
  language = 'he',
}) => {
  const records = (Object.values(spottedRecords) as SpottedRecord[]).sort(
    (a, b) => new Date(b.spottedAt).getTime() - new Date(a.spottedAt).getTime()
  );

  const geoCount = records.filter(
    (r) => typeof r.latitude === 'number' && typeof r.longitude === 'number'
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="pt-1">
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          📍 {language === 'he' ? 'יומן ומפת נסיעות' : 'Sightings'}
        </h1>
        <p className="text-sm text-slate-500">
          {language === 'he'
            ? 'מפת מסלול ומיקומים בהם נצפו הלוחיות'
            : 'A travel map of where you found plates'}
        </p>
      </header>

      {records.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-3xl ring-1 ring-slate-100 p-6 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto text-2xl shadow-inner">
            📍
          </div>
          <p className="font-extrabold text-slate-700 text-base">
            {language === 'he' ? 'אין עדיין תצפיות' : 'No sightings yet'}
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {language === 'he'
              ? 'תעדו לוחית ראשונה כדי להתחיל את מפת המסע שלכם.'
              : 'Add a discovery to start your travel map.'}
          </p>
          <button
            type="button"
            onClick={onAddDiscovery}
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            + {language === 'he' ? 'הוסף לוחית ראשונה' : 'Add a Discovery'}
          </button>
        </div>
      ) : (
        <>
          {/* Interactive Leaflet Travel Map */}
          <SightingsMapView
            records={records}
            onSelectRecord={onSelectRecord}
            language={language}
          />

          {geoCount === 0 && (
            <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-3 text-xs text-amber-700 text-center font-medium">
              💡{' '}
              {language === 'he'
                ? 'הפעל GPS בעת הוספת לוחית כדי לסמן אותה על מפת הדרכים!'
                : 'Record your GPS location when adding a discovery to pin it on the map.'}
            </div>
          )}

          {/* Sightings List */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {language === 'he'
                ? `כל התצפיות (${records.length})`
                : `All sightings (${records.length})`}
            </div>

            <div className="space-y-2">
              {records.map((rec) => {
                const st = ALL_COMBINED_STATES[rec.stateId] || STATES_DATA[rec.stateId];
                return (
                  <div
                    key={rec.stateId}
                    className="w-full flex items-center gap-3 rounded-2xl bg-white ring-1 ring-slate-200/70 p-2.5 shadow-2xs hover:shadow-xs transition-all"
                  >
                    {/* Thumbnail or Badge */}
                    <div
                      onClick={() => onSelectRecord(rec)}
                      className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center cursor-pointer relative"
                    >
                      {rec.photoUrl ? (
                        <img
                          src={rec.photoUrl}
                          alt={rec.stateId}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center text-white font-black text-xs">
                          <span>{rec.stateId}</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div
                      onClick={() => onSelectRecord(rec)}
                      className="flex-1 min-w-0 cursor-pointer text-left"
                    >
                      <div className="font-extrabold text-slate-800 text-sm truncate flex items-center gap-1.5">
                        <span>{st ? (language === 'he' ? st.nameHe : st.name) : rec.stateId}</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          {rec.stateId}
                        </span>
                      </div>

                      {rec.location ? (
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{rec.location}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {st?.region}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {new Date(rec.spottedAt).toLocaleDateString(
                          language === 'he' ? 'he-IL' : 'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                        {rec.notes && (
                          <span className="text-slate-500 truncate max-w-[130px] ml-1">
                            • “{rec.notes}”
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditRecord(rec)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              language === 'he'
                                ? `האם למחוק את התיעוד של ${st?.nameHe || rec.stateId}?`
                                : `Delete sighting for ${st?.name || rec.stateId}?`
                            )
                          ) {
                            onDeleteRecord(rec.stateId);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
