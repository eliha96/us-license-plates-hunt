import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StateInfo, SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
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

interface Base44MapViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectState: (state: StateInfo) => void;
  selectedStateId?: string | null;
  language?: 'he' | 'en';
}

export const Base44MapView: React.FC<Base44MapViewProps> = ({
  spottedRecords,
  onSelectState,
  selectedStateId,
  language = 'he',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Map state name lowercase -> StateInfo
  const stateByName = useRef<Record<string, StateInfo>>({});
  useEffect(() => {
    const map: Record<string, StateInfo> = {};
    Object.values(STATES_DATA).forEach((st) => {
      map[st.name.toLowerCase()] = st;
      map[st.id.toLowerCase()] = st;
    });
    stateByName.current = map;
  }, []);

  // Fetch GeoJSON once
  useEffect(() => {
    let isMounted = true;
    const loadGeoJson = async () => {
      try {
        const cached = localStorage.getItem('platehunt.geojson.v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setGeoData(parsed);
            setIsLoading(false);
          }
          return;
        }
      } catch {
        // continue to fetch
      }

      try {
        // Try local cached file first
        let res = await fetch('/us-states.json');
        if (!res.ok) {
          res = await fetch(
            'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'
          );
        }
        const data = await res.json();
        try {
          localStorage.setItem('platehunt.geojson.v1', JSON.stringify(data));
        } catch {
          // localStorage might be full
        }
        if (isMounted) {
          setGeoData(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load US states GeoJSON', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadGeoJson();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Detect small screen to set responsive default zoom
    const isSmall = window.innerWidth < 640;
    const initialZoom = isSmall ? 3.4 : 4;

    const map = L.map(mapContainerRef.current, {
      center: [37.8, -96.9],
      zoom: initialZoom,
      minZoom: 2.8,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: false,
    });

    // Clean light gray basemap without watermarks or API keys (Esri Canvas Light Gray)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '&copy; Esri, DeLorme, NAVTEQ',
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update GeoJSON layer when geoData or spottedRecords change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    const foundSet = new Set(Object.keys(spottedRecords));

    // Style function:
    // unfound: #cbd5e1 with opacity 0.52
    // found: regional color (West: amber, Midwest: emerald, South: red, Northeast: indigo)
    const getFeatureStyle = (feature: any) => {
      const stateName = feature.properties?.name?.toLowerCase();
      const state = stateByName.current[stateName];
      const isFound = state ? foundSet.has(state.id) : false;
      const isSelected = state ? selectedStateId === state.id : false;

      if (isFound) {
        const regionColor = (state && REGION_COLORS[state.region]) || '#6366f1';
        return {
          fillColor: regionColor,
          weight: isSelected ? 2.8 : 1.2,
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
        weight: 0.7,
        color: '#ffffff',
        fillOpacity: 0.55,
      };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
      const stateName = feature.properties?.name || '';
      const state = stateByName.current[stateName.toLowerCase()];
      const isFound = state ? foundSet.has(state.id) : false;

      const titleText = state
        ? `${state.name} (${state.nameHe})${isFound ? ' ✓' : ''}`
        : `${stateName}${isFound ? ' ✓' : ''}`;

      layer.bindTooltip(titleText, {
        sticky: true,
        direction: 'auto',
        className: 'custom-state-leaflet-tooltip',
      });

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const l = e.target;
          l.setStyle({
            weight: 2,
            color: '#0f172a',
            fillOpacity: 0.96,
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
          }
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          if (geoJsonLayerRef.current) {
            geoJsonLayerRef.current.resetStyle(e.target);
          }
        },
        click: () => {
          if (state) {
            onSelectState(state);
          }
        },
      });
    };

    const layer = L.geoJSON(geoData, {
      style: getFeatureStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);

    geoJsonLayerRef.current = layer;
  }, [geoData, spottedRecords, selectedStateId, onSelectState]);

  // Zoom control handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    const isSmall = window.innerWidth < 640;
    mapInstanceRef.current?.setView([37.8, -96.9], isSmall ? 3.4 : 4);
  };

  return (
    <div className="space-y-2">
      {/* Modern Region Color Pills Header */}
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

      {/* Main Map Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm isolate bg-slate-100">
        {/* Map Element */}
        <div
          ref={mapContainerRef}
          id="base44-leaflet-map-element"
          className="w-full h-[380px] sm:h-[420px] bg-slate-50"
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

        {/* Map Hint: tap to discover */}
        <div className="absolute bottom-2.5 right-3 z-20 pointer-events-none flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 border border-slate-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>
            {language === 'he' ? 'לחץ על מדינה לפרטים' : 'Tap a state for details'}
          </span>
        </div>
      </div>
    </div>
  );
};
