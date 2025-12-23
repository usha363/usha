
import React from 'react';
import { DriverMetrics, DriverState } from '../types';

interface AIInsightsProps {
  metrics: DriverMetrics;
  driverState: DriverState;
  speed: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({ metrics, driverState, speed }) => {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
       <h3 className="font-orbitron text-[10px] text-gray-400 uppercase mb-3">Driver Analytics</h3>
       
       <div className="space-y-4">
         <div>
           <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] text-gray-500 uppercase">Readiness Score</span>
             <span className={`text-[10px] font-bold ${
               metrics.readinessScore > 70 ? 'text-green-400' : 
               metrics.readinessScore > 30 ? 'text-orange-400' : 'text-red-400'
             }`}>{Math.floor(metrics.readinessScore)}%</span>
           </div>
           <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-1000 ${
                 metrics.readinessScore > 70 ? 'bg-green-500' : 
                 metrics.readinessScore > 30 ? 'bg-orange-500' : 'bg-red-500'
               }`}
               style={{ width: `${metrics.readinessScore}%` }}
             />
           </div>
         </div>

         <div className="grid grid-cols-2 gap-2">
            <InsightBox label="Gaze" value={metrics.headPose.toUpperCase()} color="text-cyan-400" />
            <InsightBox label="Blink" value={metrics.eyesOpen ? 'NORMAL' : 'EXTENDED'} color={metrics.eyesOpen ? 'text-green-400' : 'text-red-400'} />
            <InsightBox label="Activity" value={speed > 10 ? 'DRIVING' : 'STATIONARY'} color="text-gray-400" />
            <InsightBox label="Logic" value="NEURAL" color="text-blue-400" />
         </div>

         <div className="p-2 bg-black/40 rounded border border-white/5 text-[9px] text-gray-400">
           <span className="text-cyan-500 font-bold">PREDICTIVE:</span> {
             driverState === DriverState.ALERT ? "Driver state is nominal. No action required." :
             driverState === DriverState.DISTRACTED ? "High probability of lane departure within 4.2s." :
             "CRITICAL: Microsleep risk detected based on visual analysis."
           }
         </div>
       </div>
    </div>
  );
};

const InsightBox = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="bg-black/40 p-2 rounded border border-white/5">
    <div className="text-[8px] text-gray-600 uppercase mb-0.5">{label}</div>
    <div className={`text-[9px] font-bold ${color}`}>{value}</div>
  </div>
);

export default AIInsights;
