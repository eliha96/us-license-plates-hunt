import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SpottedRecord, StateInfo } from '../types';
import { STATES_DATA } from '../data/statesData';

interface SightingsMapViewProps {
  records: SpottedRecord[];
  onSelectRecord?: (record: SpottedRecord) => void;
  language?: 'he' | 'en';
}

export const SightingsMapView: React.FC<SightingsMapViewProps> = ({
  records,
  onSelectRecord,
  language = 'he',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const geoRecords = records.filter(
    (r) => typeof r.latitude === 'number' && typeof r.longitude === 'number'
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [39.5, -98.35],
      zoom: 3.8,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '&copy; Esri, DeLorme, NAVTEQ',
      }
    ).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (geoRecords.length === 0) {
      map.setView([39.5, -98.35], 3.8);
      return;
    }

    const bounds = L.latLngBounds([]);

    geoRecords.forEach((rec) => {
      if (rec.latitude == null || rec.longitude == null) return;
      const latLng: [number, number] = [rec.latitude, rec.longitude];
      bounds.extend(latLng);

      const state = STATES_DATA[rec.stateId];
      const stateName = state
        ? language === 'he'
          ? `${state.nameHe} (${state.id})`
          : `${state.name} (${state.id})`
        : rec.stateId;

      // Custom HTML Pin icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.25);
            border: 2px solid white;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 11px;
              font-weight: 800;
              font-family: sans-serif;
            ">${rec.stateId}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      const dateStr = new Date(rec.spottedAt).toLocaleDateString(
        language === 'he' ? 'he-IL' : 'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      );

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 220px; direction: ${
          language === 'he' ? 'rtl' : 'ltr'
        }">
          <div style="font-weight: 800; font-size: 14px; color: #1e1b4b; margin-bottom: 2px;">
            ${stateName}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            📅 ${dateStr}
          </div>
          ${
            rec.location
              ? `<div style="font-size: 12px; color: #334155; margin-bottom: 4px;">📍 ${rec.location}</div>`
              : ''
          }
          ${
            rec.notes
              ? `<div style="font-size: 11px; color: #475569; font-style: italic;">“${rec.notes}”</div>`
              : ''
          }
          ${
            rec.photoUrl
              ? `<img src="${rec.photoUrl}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-top: 6px;" />`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectRecord) onSelectRecord(rec);
      });

      markersGroup.addLayer(marker);
    });

    if (geoRecords.length === 1) {
      map.setView([geoRecords[0].latitude!, geoRecords[0].longitude!], 6);
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [records, language, onSelectRecord]);

  return (
    <div className="rounded-3xl overflow-hidden ring-1 ring-indigo-100 shadow-sm isolate bg-slate-100 relative">
      <div
        ref={mapContainerRef}
        id="sightings-leaflet-map-element"
        className="w-full h-[240px] sm:h-[280px]"
      />
      <div className="absolute top-2.5 right-3 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-indigo-700 border border-indigo-100 shadow-2xs">
        📍 {geoRecords.length} {language === 'he' ? 'מיקומים על המפה' : 'pinned on map'}
      </div>
    </div>
  );
};
