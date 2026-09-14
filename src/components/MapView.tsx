import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StateInfo, SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
import {
  CANADA_PROVINCES_DATA,
  MEXICO_DATA,
  isCanadaUnlocked,
  isMexicoUnlocked,
} from '../data/bonusData';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const REGION_COLORS: Record<string, string> = {
  West: '#f59e0b', // warm gold/amber
  Midwest: '#10b981', // emerald green
  South: '#ef4444', // coral red
  Northeast: '#6366f1', // indigo / violet
};

const REGIONS_INFO = [
  { id: 'West', nameHe: 'מערב', nameEn: 'West', color: '#f59e0b' },
  { id: 'Midwest', nameHe: 'מערב-תיכון', nameEn: 'Midwest', color: '#10b981' },
  { id: 'South', nameHe: 'דרום', nameEn: 'South', color: '#ef4444' },
  { id: 'Northeast', nameHe: 'צפון-מזרח', nameEn: 'Northeast', color: '#6366f1' },
];

interface MapViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectState?: (state: StateInfo) => void;
  selectedStateId?: string | null;
  language?: 'he' | 'en';
  isStatic?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  spottedRecords,
  onSelectState,
  selectedStateId,
  language = 'he',
  isStatic = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [usGeoData, setUsGeoData] = useState<any>(null);
  const [canadaGeoData, setCanadaGeoData] = useState<any>(null);
  const [mexicoGeoData, setMexicoGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const usFoundCount = Object.keys(spottedRecords).filter((id) => STATES_DATA[id]).length;
  const canadaUnlocked = isCanadaUnlocked(usFoundCount);
  const mexicoUnlocked = isMexicoUnlocked(usFoundCount);

  // Map all state / province IDs -> StateInfo
  const allStateDataMap = useRef<Record<string, StateInfo>>({});
  useEffect(() => {
    const map: Record<string, StateInfo> = {};
    Object.values(STATES_DATA).forEach((st) => {
      map[st.name.toLowerCase()] = st;
      map[st.id.toLowerCase()] = st;
    });
    Object.values(CANADA_PROVINCES_DATA).forEach((st) => {
      map[st.name.toLowerCase()] = st;
      map[st.id.toLowerCase()] = st;
    });
    map['yukon territory'] = CANADA_PROVINCES_DATA['YT'];

    Object.values(MEXICO_DATA).forEach((st) => {
      map[st.name.toLowerCase()] = st;
      map[st.id.toLowerCase()] = st;
    });
    allStateDataMap.current = map;
  }, []);

  // Fetch GeoJSON files (US, Canada, Mexico)
  useEffect(() => {
    let isMounted = true;
    const loadAllGeoJson = async () => {
      try {
        // Load US GeoJSON
        let usData: any = null;
        try {
          const cached = localStorage.getItem('platehunt.geojson.us.v2');
          if (cached) usData = JSON.parse(cached);
        } catch {
          // ignore cache error
        }

        if (!usData) {
          let res = await fetch('/us-states.json');
          if (!res.ok) {
            res = await fetch(
              'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'
            );
          }
          usData = await res.json();
          try {
            localStorage.setItem('platehunt.geojson.us.v2', JSON.stringify(usData));
          } catch {
            // storage limit
          }
        }

        // Load Canada GeoJSON
        let canadaData: any = null;
        try {
          const resCa = await fetch('/canada-provinces.json');
          if (resCa.ok) canadaData = await resCa.json();
        } catch (err) {
          console.warn('Failed to load Canada GeoJSON', err);
        }

        // Load Mexico GeoJSON
        let mexicoData: any = null;
        try {
          const resMx = await fetch('/mexico.json');
          if (resMx.ok) mexicoData = await resMx.json();
        } catch (err) {
          console.warn('Failed to load Mexico GeoJSON', err);
        }

        if (isMounted) {
          setUsGeoData(usData);
          setCanadaGeoData(canadaData);
          setMexicoGeoData(mexicoData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load GeoJSON layers', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadAllGeoJson();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const isSmall = window.innerWidth < 640;
    const initialZoom = isStatic ? 3.4 : isSmall ? 3.1 : 3.6;

    const map = L.map(mapContainerRef.current, {
      center: [41.5, -96.0],
      zoom: initialZoom,
      minZoom: 2.3,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: false,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        crossOrigin: true,
        attribution: '&copy; Esri, DeLorme, NAVTEQ',
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isStatic]);

  // Render Vector GeoJSON Polygons on Unified North America Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (!usGeoData) return;

    const foundSet = new Set(Object.keys(spottedRecords));

    // Combine feature collections dynamically depending on unlocks
    const combinedFeatures: any[] = [...(usGeoData.features || [])];

    if (canadaUnlocked && canadaGeoData?.features) {
      combinedFeatures.push(...canadaGeoData.features);
    }

    if (mexicoUnlocked && mexicoGeoData?.features) {
      combinedFeatures.push(...mexicoGeoData.features);
    }

    const combinedGeoJson: any = {
      type: 'FeatureCollection',
      features: combinedFeatures,
    };

    const getFeatureStyle = (feature: any) => {
      const idOrName = (feature.properties?.id || feature.properties?.name || '').toLowerCase();
      const state = allStateDataMap.current[idOrName];

      if (!state) {
        return {
          fillColor: '#e2e8f0',
          weight: 0.5,
          color: '#ffffff',
          fillOpacity: 0.4,
        };
      }

      const isFound = foundSet.has(state.id);
      const isSelected = selectedStateId === state.id;

      if (isFound) {
        const regionColor =
          state?.country === 'Canada'
            ? '#d97706'
            : state?.country === 'Mexico'
            ? '#059669'
            : REGION_COLORS[state?.region || ''] || '#6366f1';

        return {
          fillColor: regionColor,
          weight: isSelected ? 2.8 : 1.4,
          color: isSelected ? '#0f172a' : '#ffffff',
          fillOpacity: 0.92,
        };
      }

      if (isSelected) {
        return {
          fillColor: '#cbd5e1',
          weight: 2.2,
          color: '#4f46e5',
          fillOpacity: 0.8,
        };
      }

      return {
        fillColor: '#cbd5e1',
        weight: 0.8,
        color: '#ffffff',
        fillOpacity: 0.6,
      };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
      const idOrName = (feature.properties?.id || feature.properties?.name || '').toLowerCase();
      const state = allStateDataMap.current[idOrName];

      if (!state) {
        const name = feature.properties?.name || '';
        layer.bindTooltip(
          language === 'he'
            ? `${name} (לא חלק מהמשחק)`
            : `${name} (Not in game)`,
          {
            sticky: true,
            direction: 'auto',
            className: 'custom-state-leaflet-tooltip-disabled',
          }
        );
        return;
      }

      const isFound = foundSet.has(state.id);
      const titleText = `${state.name} (${state.nameHe})${isFound ? ' ✓' : ''}`;

      layer.bindTooltip(titleText, {
        sticky: true,
        direction: 'auto',
        className: 'custom-state-leaflet-tooltip',
      });

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const l = e.target;
          l.setStyle({
            weight: 2.5,
            color: '#0f172a',
            fillOpacity: 0.96,
          });
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          if (geoJsonLayerRef.current) {
            geoJsonLayerRef.current.resetStyle(e.target);
          }
        },
        click: (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          if (state && onSelectState) {
            onSelectState(state);
          }
        },
      });
    };

    const layer = L.geoJSON(combinedGeoJson, {
      style: getFeatureStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);

    geoJsonLayerRef.current = layer;
  }, [usGeoData, canadaGeoData, mexicoGeoData, canadaUnlocked, mexicoUnlocked, spottedRecords, selectedStateId, onSelectState]);

  // Zoom control handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const isSmall = window.innerWidth < 640;
    map.setView([41.5, -96.0], isStatic ? 3.4 : isSmall ? 3.1 : 3.6);
  };

  return (
    <div className="space-y-2">
      {/* US Region Color Pills Header */}
      {!isStatic && (
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {REGIONS_INFO.map((reg) => {
            const countInReg = Object.values(STATES_DATA).filter(
              (s) => s.region === reg.id && spottedRecords[s.id]
            ).length;
            const totalInReg = Object.values(STATES_DATA).filter((s) => s.region === reg.id).length;

            return (
              <div
                key={reg.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs text-[11px] font-bold text-slate-700 shrink-0"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: reg.color }}
                />
                <span>{language === 'he' ? reg.nameHe : reg.nameEn}</span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {countInReg}/{totalInReg}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Map Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm isolate bg-slate-100">
        {/* Map Element */}
        <div
          ref={mapContainerRef}
          id="leaflet-map-element"
          className={`w-full ${isStatic ? 'h-[360px]' : 'h-[380px] sm:h-[440px]'} bg-slate-50`}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>{language === 'he' ? 'טוען מפה...' : 'Loading map...'}</span>
            </div>
          </div>
        )}

        {/* Sleek Floating Zoom & Reset Buttons */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 shadow-sm border border-slate-200/90 flex items-center justify-center hover:bg-white active:scale-95 transition-all text-sm font-bold cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 shadow-sm border border-slate-200/90 flex items-center justify-center hover:bg-white active:scale-95 transition-all text-sm font-bold cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 shadow-sm border border-slate-200/90 flex items-center justify-center hover:bg-white active:scale-95 transition-all text-sm font-bold cursor-pointer"
            title={language === 'he' ? 'איפוס מבט' : 'Reset View'}
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Map Hint */}
        {!isStatic && (
          <div className="absolute bottom-2.5 right-3 z-20 pointer-events-none flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>
              {language === 'he' ? 'לחץ על טריטוריה לפרטים' : 'Tap a territory for details'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


