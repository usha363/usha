
import React, { useState, useEffect } from 'react';
import { DriveMode, DriverState, TORUrgency } from '../types';

interface DashboardProps {
  speed: number;
  targetSpeed: number;
  mode: DriveMode;
  driverState: DriverState;
  torUrgency: TORUrgency;
  hazardsActive: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ speed, targetSpeed, mode, driverState, torUrgency, hazardsActive }) => {
  const [hazardFlash, setHazardFlash] = useState(false);

  useEffect(() => {
    let interval: any;
    if (hazardsActive) {
      interval = setInterval(() => setHazardFlash(f => !f), 500);
    } else {
      setHazardFlash(false);
    }
    return () => clearInterval(interval);
  }, [hazardsActive]);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 items-end">
      <div className="flex flex-col items-center">
         <div className={`w-12 h-12 flex items-center justify-center transition-all duration-300 ${hazardFlash ? 'text-red-500 scale-125' : 'text-gray-700'}`}>
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2L1 21h22L12 2zm0 5l7.53 12H4.47L12 7zm-1 8h2v2h-2v-2zm0-6h2v4h-2V9z" />
            </svg>
         </div>
         <span className="text-[10px] text-gray-500 uppercase mt-2">Hazard Lights</span>
      </div>

      <div className="flex flex-col items-center bg-black/80 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] scale-110">
        <div className="flex items-baseline gap-2">
          <span className={`font-orbitron text-7xl font-black tabular-nums ${
            mode === DriveMode.EMERGENCY_CONTROL ? 'text-red-500 animate-pulse' : 'text-white'
          }`}>
            {Math.floor(speed)}
          </span>
          <span className="text-xl font-orbitron text-gray-500">KM/H</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${(speed / 140) * 100}%` }} />
        </div>
        
        <div className="flex gap-4 mt-6 w-full justify-center">
           <StatusIndicator label="AUTO-STEER" active={mode !== DriveMode.MANUAL} />
           <StatusIndicator label="E-BRAKE" active={speed < targetSpeed} />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className={`text-[10px] mb-2 font-bold uppercase ${driverState === DriverState.ALERT ? 'text-green-500' : 'text-red-500'}`}>
          {driverState}
        </div>
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
           <div className={`h-full transition-all duration-500 ${driverState === DriverState.ALERT ? 'bg-green-500 w-full' : 'bg-red-500 w-1/3'}`} />
        </div>
        <span className="text-[10px] text-gray-500 uppercase mt-2">Attention Level</span>
      </div>
    </div>
  );
};

const StatusIndicator = ({ label, active }: { label: string, active: boolean }) => (
  <div className={`px-3 py-1 rounded text-[9px] font-bold border transition-all duration-300 ${
    active ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-transparent text-gray-700 border-gray-800'
  }`}>
    {label}
  </div>
);

export default Dashboard;
