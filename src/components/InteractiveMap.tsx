import React from 'react';
import { SvgMapView } from './SvgMapView';
import { StateInfo, SpottedRecord } from '../types';

interface InteractiveMapProps {
  spottedRecords: Record<string, SpottedRecord>;
  onSelectState: (state: StateInfo) => void;
  selectedStateId?: string | null;
  language?: 'he' | 'en';
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  spottedRecords,
  onSelectState,
  selectedStateId,
  language = 'he',
}) => {
  return (
    <div id="interactive-map-wrapper" className="w-full">
      <SvgMapView
        spottedRecords={spottedRecords}
        onSelectState={onSelectState}
        selectedStateId={selectedStateId}
        language={language}
      />
    </div>
  );
};
