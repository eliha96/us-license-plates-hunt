import React from 'react';
import { StateInfo } from '../types';

interface LicensePlateBadgeProps {
  state: StateInfo;
  plateNumber?: string;
  isSpotted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LicensePlateBadge: React.FC<LicensePlateBadgeProps> = ({
  state,
  plateNumber,
  isSpotted = false,
  size = 'md',
  className = '',
}) => {
  const displayPlateNumber = plateNumber || state.samplePlateNumber;

  const sizeStyles = {
    sm: {
      container: 'w-28 h-14 rounded-md p-1 border',
      stateName: 'text-[9px] tracking-wider',
      number: 'text-xs tracking-widest font-bold',
      slogan: 'text-[7px]',
      holes: 'w-1 h-1',
    },
    md: {
      container: 'w-44 h-22 rounded-lg p-1.5 border-2 shadow-sm',
      stateName: 'text-[11px] tracking-widest font-bold',
      number: 'text-lg tracking-widest font-extrabold',
      slogan: 'text-[9px] font-medium',
      holes: 'w-1.5 h-1.5',
    },
    lg: {
      container: 'w-64 h-32 rounded-xl p-2.5 border-2 shadow-md',
      stateName: 'text-sm tracking-widest font-extrabold',
      number: 'text-2xl tracking-widest font-black',
      slogan: 'text-[10px] font-medium',
      holes: 'w-2 h-2',
    },
  }[size];

  return (
    <div
      id={`plate-badge-${state.id}-${size}`}
      className={`relative flex flex-col justify-between items-center text-center overflow-hidden transition-transform duration-200 select-none ${sizeStyles.container} ${className}`}
      style={{
        backgroundColor: state.plateDesign.bg,
        borderColor: state.plateDesign.border,
        color: state.plateDesign.text,
      }}
    >
      {/* Top bolt holes */}
      <div className="absolute top-1 left-3 flex gap-1">
        <span className={`rounded-full bg-stone-400/40 border border-stone-500/30 ${sizeStyles.holes}`} />
      </div>
      <div className="absolute top-1 right-3 flex gap-1">
        <span className={`rounded-full bg-stone-400/40 border border-stone-500/30 ${sizeStyles.holes}`} />
      </div>

      {/* State Header */}
      <div className="w-full flex items-center justify-between px-2 pt-0.5">
        <span
          className="text-[8px] font-bold uppercase opacity-75"
          style={{ color: state.plateDesign.accent }}
        >
          {state.id}
        </span>
        <span
          className={`uppercase font-sans font-black tracking-wider truncate max-w-[80%] ${sizeStyles.stateName}`}
          style={{ color: state.plateDesign.accent }}
        >
          {state.name}
        </span>
        <span
          className="text-[8px] font-bold uppercase opacity-75"
          style={{ color: state.plateDesign.accent }}
        >
          USA
        </span>
      </div>

      {/* Center Number */}
      <div className="my-auto py-0.5">
        <span
          className={`font-mono tracking-widest uppercase drop-shadow-xs ${sizeStyles.number}`}
          style={{ color: state.plateDesign.text }}
        >
          {displayPlateNumber}
        </span>
      </div>

      {/* Slogan Footer */}
      <div className="w-full pb-0.5 px-1 truncate">
        <span
          className={`block italic opacity-85 truncate ${sizeStyles.slogan}`}
          style={{ color: state.plateDesign.accent }}
        >
          {state.slogan}
        </span>
      </div>

      {/* Spotted stamp mark */}
      {isSpotted && (
        <div
          id={`plate-spotted-stamp-${state.id}`}
          className="absolute inset-0 bg-emerald-600/10 pointer-events-none flex items-center justify-center"
        >
          <span className="border-2 border-emerald-600 text-emerald-700 font-black text-[10px] tracking-widest px-2 py-0.5 rounded rotate-[-12deg] uppercase bg-white/80 shadow-xs">
            SPOTTED ✓
          </span>
        </div>
      )}
    </div>
  );
};
