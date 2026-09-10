import React, { useState, useRef, useMemo, useCallback } from 'react';
import { StateInfo, SpottedRecord } from '../types';
import { STATES_DATA } from '../data/statesData';
import { US_REGIONS } from '../data/regionsData';
import { US_MAP_PATHS, StatePath } from '../data/usMapPaths';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
  Search,
  Plus,
  Info,
  CheckCircle2,
  Sparkles,
  MapPin,
  X,
} from 'lucide-react';

interface SvgMapViewProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectState: (state: StateInfo) => void;
  selectedStateId?: string | null;
  language?: 'he' | 'en';
}

// Small East Coast states that benefit from slightly enhanced tap targets & callout labels
const SMALL_EAST_STATES = new Set(['DC', 'DE', 'RI', 'CT', 'NJ', 'MD']);

export const SvgMapView: React.FC<SvgMapViewProps> = ({
  spottedRecords,
  onSelectState,
  selectedStateId,
  language = 'he',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [activeStateId, setActiveStateId] = useState<string | null>(selectedStateId || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Sync prop selectedStateId with activeStateId
  React.useEffect(() => {
    if (selectedStateId) {
      setActiveStateId(selectedStateId);
    }
  }, [selectedStateId]);

  const spottedCount = Object.keys(spottedRecords).length;
  const totalCount = 50;

  // Active state data
  const activeState = activeStateId ? STATES_DATA[activeStateId] : null;
  const isSelectedStateSpotted = activeState ? Boolean(spottedRecords[activeState.id]) : false;

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag / Pan handlers for touch and mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Handle State Click
  const handleStateClick = (stateId: string) => {
    setActiveStateId(stateId);
    const st = STATES_DATA[stateId];
    if (st) {
      onSelectState(st);
    }
  };

  // Filtered states for quick search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return Object.values(STATES_DATA)
      .filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.nameHe.includes(q)
      )
      .slice(0, 6);
  }, [searchQuery]);

  return (
    <div
      ref={containerRef}
      id="svg-map-view-container"
      className={`relative bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none p-2 sm:p-4 bg-slate-900/90 backdrop-blur-md flex flex-col justify-between'
          : 'p-3 sm:p-5'
      }`}
    >
      {/* Top Header & Search Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Title & Sighting counter */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-lg shadow-2xs shrink-0">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="svg-map-title"
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    isFullscreen ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {language === 'he' ? 'מפת ארצות הברית' : 'United States Map'}
                </h3>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-xs font-mono font-black">
                  {spottedCount}/50
                </span>
              </div>
              <p
                className={`text-xs ${
                  isFullscreen ? 'text-stone-300' : 'text-stone-500'
                }`}
              >
                {language === 'he'
                  ? 'לחץ על כל מדינה כדי לתעד או לצפות בה (צביעה אוטומטית בעת מציאה)'
                  : 'Click any state to log or view it (colors automatically once spotted)'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search and Map Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Search Jump */}
          <div className="relative flex-1 sm:w-56">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="map-quick-state-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'he' ? 'חפש מדינה...' : 'Find state...'}
                className={`w-full pr-9 pl-8 py-2 text-xs sm:text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium ${
                  isFullscreen
                    ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-400'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick search dropdown */}
            {searchResults.length > 0 && (
              <div
                id="search-results-dropdown"
                className="absolute z-40 top-full mt-1 right-0 w-full bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden"
              >
                {searchResults.map((s) => {
                  const isSpotted = Boolean(spottedRecords[s.id]);
                  const reg = US_REGIONS[s.region];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        handleStateClick(s.id);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-right hover:bg-stone-50 flex items-center justify-between text-xs border-b border-stone-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-[10px] text-white"
                          style={{
                            backgroundColor: isSpotted ? reg?.color : '#64748B',
                          }}
                        >
                          {s.id}
                        </span>
                        <span className="font-bold text-stone-800">
                          {language === 'he' ? s.nameHe : s.name}
                        </span>
                      </div>
                      {isSpotted ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          {language === 'he' ? 'נמצאה' : 'Spotted'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">
                          {language === 'he' ? 'טרם נצפתה' : 'Not yet'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Label Toggle Button */}
          <button
            id="btn-toggle-labels"
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1 shrink-0 ${
              showLabels
                ? 'bg-stone-900 text-white border-stone-900'
                : isFullscreen
                ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
            }`}
            title="Toggle Labels"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'he' ? (showLabels ? 'כיתוב: פעיל' : 'הצג כיתוב') : showLabels ? 'Labels: ON' : 'Labels'}
            </span>
          </button>

          {/* Fullscreen Mobile Expand Toggle */}
          <button
            id="btn-toggle-fullscreen"
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className={`p-2.5 text-xs font-bold rounded-xl border transition-colors shrink-0 ${
              isFullscreen
                ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map / מסך מלא'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area: Extra tall for phone screens */}
      <div
        id="svg-map-canvas-container"
        className={`relative w-full rounded-2xl overflow-hidden border transition-all select-none ${
          isFullscreen
            ? 'flex-1 bg-slate-950 border-stone-800'
            : 'h-[58vh] sm:h-[620px] min-h-[440px] bg-slate-50 border-stone-200 shadow-inner'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Floating Zoom & Reset Controls: Large 48px touch targets for mobile thumbs */}
        <div
          id="map-zoom-controls"
          className="absolute top-3 left-3 z-30 flex flex-col gap-2"
        >
          <button
            id="btn-map-zoom-in"
            type="button"
            onClick={handleZoomIn}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 text-stone-800 shadow-md border border-stone-200 flex items-center justify-center hover:bg-white active:scale-95 transition-all text-base font-bold focus:outline-hidden"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            id="btn-map-zoom-out"
            type="button"
            onClick={handleZoomOut}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 text-stone-800 shadow-md border border-stone-200 flex items-center justify-center hover:bg-white active:scale-95 transition-all text-base font-bold focus:outline-hidden"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {zoom > 1 && (
            <button
              id="btn-map-reset-zoom"
              type="button"
              onClick={handleReset}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 text-white shadow-md flex items-center justify-center hover:bg-stone-800 active:scale-95 transition-all focus:outline-hidden"
              title="Reset View / איפוס תצוגה"
              aria-label="Reset View"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Floating Zoom Level Indicator */}
        {zoom > 1 && (
          <div className="absolute top-3 right-3 z-20 bg-stone-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold">
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* The SVG Albers USA Projection Map */}
        <svg
          id="us-albers-svg-map"
          viewBox="0 0 960 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <defs>
            {/* Soft drop-shadow for active/selected state */}
            <filter id="state-highlight-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.4" />
            </filter>
            <filter id="state-hover-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* All 50 State SVG Paths */}
          <g id="states-group">
            {Object.values(US_MAP_PATHS).map((statePath: StatePath) => {
              const state = STATES_DATA[statePath.id];
              if (!state) return null;

              const isSpotted = Boolean(spottedRecords[state.id]);
              const isSelected = activeStateId === state.id;
              const isHovered = hoveredStateId === state.id;
              const region = US_REGIONS[state.region];

              // Unspotted = Neutral Slate Gray. Spotted = Vibrant Regional Color!
              let fillColor = '#E2E8F0'; // Default gray
              let strokeColor = '#94A3B8';
              let strokeWidth = 1.2;

              if (isSpotted) {
                fillColor = region?.color || '#10B981';
                strokeColor = isSelected ? '#0F172A' : (region?.borderColor || '#047857');
                strokeWidth = isSelected ? 2.6 : 1.6;
              } else if (isSelected) {
                fillColor = '#CBD5E1';
                strokeColor = '#0F172A';
                strokeWidth = 2.4;
              } else if (isHovered) {
                fillColor = '#CBD5E1';
                strokeColor = '#64748B';
                strokeWidth = 1.6;
              }

              return (
                <path
                  key={state.id}
                  id={`state-path-${state.id}`}
                  d={statePath.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="cursor-pointer transition-colors duration-150"
                  filter={isSelected ? 'url(#state-highlight-glow)' : isHovered ? 'url(#state-hover-glow)' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStateClick(state.id);
                  }}
                  onMouseEnter={() => setHoveredStateId(state.id)}
                  onMouseLeave={() => setHoveredStateId(null)}
                >
                  <title>{`${state.id} - ${state.name} (${state.nameHe})`}</title>
                </path>
              );
            })}
          </g>

          {/* State Labels & Badges */}
          {showLabels && (
            <g id="state-labels-group" className="pointer-events-none select-none">
              {Object.values(US_MAP_PATHS).map((statePath: StatePath) => {
                const state = STATES_DATA[statePath.id];
                if (!state) return null;

                const [cx, cy] = statePath.center;
                const isSpotted = Boolean(spottedRecords[state.id]);
                const isSelected = activeStateId === state.id;
                const isSmall = SMALL_EAST_STATES.has(state.id);

                // For tiny northeastern states, only show short code
                const labelText = state.id;
                const subText = isSmall ? '' : (language === 'he' ? state.nameHe : state.name);

                return (
                  <g
                    key={`label-${state.id}`}
                    id={`state-label-${state.id}`}
                    transform={`translate(${cx}, ${cy})`}
                    className="transition-all"
                  >
                    {/* Badge Background Pill */}
                    <rect
                      x={isSmall ? -11 : -18}
                      y={subText ? -13 : -8}
                      width={isSmall ? 22 : 36}
                      height={subText ? 24 : 16}
                      rx={5}
                      ry={5}
                      fill={isSpotted ? '#0F172A' : '#FFFFFF'}
                      fillOpacity={isSpotted ? 0.88 : 0.9}
                      stroke={isSelected ? '#0F172A' : isSpotted ? '#FFFFFF' : '#94A3B8'}
                      strokeWidth={isSelected ? 1.8 : 0.8}
                    />

                    {/* State Code */}
                    <text
                      y={subText ? -1 : 4}
                      textAnchor="middle"
                      fill={isSpotted ? '#FFFFFF' : '#0F172A'}
                      fontSize={isSmall ? '10px' : '11px'}
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {labelText}
                    </text>

                    {/* Sighting Checkmark or Mini Name */}
                    {isSpotted ? (
                      <text
                        y={subText ? 8 : 4}
                        x={subText ? 0 : 0}
                        textAnchor="middle"
                        fill="#34D399"
                        fontSize="9px"
                        fontWeight="bold"
                      >
                        ✓
                      </text>
                    ) : subText ? (
                      <text
                        y={8}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="7px"
                        fontWeight="600"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {subText.length > 7 ? subText.slice(0, 6) + '…' : subText}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Mobile State Quick-Action Card (Slides up when a state is tapped) */}
        {activeState && (
          <div
            id="mobile-state-action-drawer"
            className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:bottom-4 z-40 bg-white/98 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-stone-200 sm:max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-200"
            dir={language === 'he' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-xs"
                  style={{
                    backgroundColor: isSelectedStateSpotted
                      ? US_REGIONS[activeState.region]?.color
                      : '#64748B',
                  }}
                >
                  {activeState.id}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-stone-900 leading-tight">
                    {language === 'he' ? activeState.nameHe : activeState.name}
                  </h4>
                  <span className="text-xs text-stone-500 font-medium">
                    {activeState.name} • {language === 'he' ? activeState.capitalHe : activeState.capital}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveStateId(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Region & Sighting Status */}
            <div className="flex items-center justify-between text-xs py-2 border-y border-stone-100 mb-2.5">
              <span className="font-semibold text-stone-600">
                {language === 'he'
                  ? US_REGIONS[activeState.region]?.nameHe
                  : US_REGIONS[activeState.region]?.nameEn}
              </span>
              {isSelectedStateSpotted ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'he' ? 'נצפתה בהצלחה!' : 'Spotted!'}
                </span>
              ) : (
                <span className="text-stone-400 font-medium">
                  {language === 'he' ? 'אפורה (טרם נצפתה)' : 'Not yet spotted'}
                </span>
              )}
            </div>

            {/* Big Thumb-Friendly Action Button */}
            <button
              id="btn-active-state-action"
              type="button"
              onClick={() => onSelectState(activeState)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${
                isSelectedStateSpotted
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSelectedStateSpotted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {language === 'he' ? 'צפה בפרטי הלוחית / ערוך' : 'View / Edit Plate'}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    {language === 'he'
                      ? `תעד לוחית מ-${activeState.nameHe}`
                      : `Log ${activeState.name} Plate`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
