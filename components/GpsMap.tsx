
import React, { useState, useEffect } from 'react';
import { RoadType, DriveMode } from '../types';

interface GpsMapProps {
  onContextChange: (type: RoadType) => void;
  mode: DriveMode;
  isEmergency: boolean;
  hospitalName: string;
  distance: string;
}

const GpsMap: React.FC<GpsMapProps> = ({ onContextChange, mode, isEmergency, hospitalName, distance }) => {
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 37.7749, lng: -122.4194 })
    );
  }, []);

  return (
    <div className="flex flex-col gap-2 h-72">
      <h3 className="font-orbitron text-[10px] text-gray-400 uppercase flex justify-between">
        Contextual Routing
        <span className="text-cyan-500">GLO-NAV v4.2</span>
      </h3>
      
      <div className="flex-1 bg-black rounded-xl border border-white/10 overflow-hidden relative group">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
           <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>

        {/* Dynamic Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           <path 
             d="M20 180 Q 50 100 150 50" 
             fill="transparent" 
             stroke={isEmergency ? "#ef4444" : "#06b6d4"} 
             strokeWidth="2" 
             strokeDasharray="4,4" 
             className="animate-[dash_10s_linear_infinite]"
           />
        </svg>

        {/* Current Vehicle Position */}
        <div className="absolute bottom-10 left-10">
           <div className={`w-6 h-6 rounded-full ${isEmergency ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-cyan-500 shadow-[0_0_15px_cyan]'} animate-pulse`} />
           <div className="text-[7px] text-white/50 mt-1 uppercase font-bold text-center">Vehicle</div>
        </div>

        {/* Rescue Point / Hospital */}
        <div className={`absolute top-10 right-10 transition-all duration-1000 ${isEmergency ? 'scale-110 opacity-100' : 'opacity-30 grayscale'}`}>
           <div className="w-10 h-10 bg-white rounded flex items-center justify-center border-2 border-red-500 relative">
              <span className="text-red-500 font-bold text-2xl">+</span>
              {isEmergency && <div className="absolute -inset-2 border border-red-500 rounded animate-ping" />}
           </div>
           <div className="text-[7px] text-white mt-1 uppercase font-bold text-center">Rescue Point</div>
        </div>

        {/* Info HUD */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
           <div className="flex justify-between items-center mb-2">
              <div>
                 <div className="text-[7px] text-gray-500 uppercase tracking-widest">Medical Context</div>
                 <div className={`text-[10px] font-bold ${isEmergency ? 'text-red-400' : 'text-cyan-400'}`}>{hospitalName}</div>
              </div>
              <div className="text-right">
                 <div className="text-[7px] text-gray-500 uppercase">Proximity</div>
                 <div className="text-[10px] font-bold text-white">{distance}</div>
              </div>
           </div>
           
           {isEmergency && (
             <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] text-gray-300 uppercase font-mono tracking-tighter">Emergency Channel: Family Notified</span>
             </div>
           )}
        </div>
      </div>

      <div className="text-[8px] text-gray-600 font-mono mt-1 px-1">
        LAT: {coords?.lat.toFixed(5) || '---'} | LNG: {coords?.lng.toFixed(5) || '---'}
      </div>
    </div>
  );
};

export default GpsMap;
