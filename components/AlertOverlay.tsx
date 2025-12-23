
import React, { useEffect, useState } from 'react';
import { TORUrgency } from '../types';

interface AlertOverlayProps {
  urgency: TORUrgency;
  message: string;
}

const AlertOverlay: React.FC<AlertOverlayProps> = ({ urgency, message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (urgency !== TORUrgency.NONE || message) {
      setVisible(true);
      // Haptic Feedback Simulation (if browser supports it)
      if (window.navigator.vibrate) {
        if (urgency === TORUrgency.HIGH) window.navigator.vibrate([200, 100, 200]);
        else if (urgency === TORUrgency.MEDIUM) window.navigator.vibrate(100);
      }
    } else {
      setVisible(false);
    }
  }, [urgency, message]);

  if (!visible || !message) return null;

  return (
    <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${
      urgency === TORUrgency.HIGH ? 'scale-110' : 'scale-100'
    }`}>
      <div className={`px-12 py-6 rounded-2xl backdrop-blur-xl border-2 flex flex-col items-center shadow-2xl ${
        urgency === TORUrgency.HIGH 
          ? 'bg-red-900/40 border-red-500 shadow-red-500/40 animate-pulse' 
          : 'bg-orange-900/40 border-orange-500 shadow-orange-500/40'
      }`}>
        <div className="flex items-center gap-4 mb-2">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <span className="font-orbitron text-2xl font-black text-white tracking-[0.2em]">{message}</span>
        </div>
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest text-center max-w-xs">
          {urgency === TORUrgency.HIGH ? "Please place your hands on the steering wheel immediately." : "Driver attention required to maintain cruise levels."}
        </p>
      </div>
    </div>
  );
};

export default AlertOverlay;
