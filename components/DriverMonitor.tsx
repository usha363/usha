
import React, { useRef, useEffect, useState } from 'react';
import { DriverState, DriverMetrics } from '../types';

interface DriverMonitorProps {
  onMetricsChange: (metrics: DriverMetrics) => void;
  driverState: DriverState;
}

const DriverMonitor: React.FC<DriverMonitorProps> = ({ onMetricsChange, driverState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Real-time AI Simulation States
  const [simEyesOpen, setSimEyesOpen] = useState(true);
  const [simFaceDetected, setSimFaceDetected] = useState(true);
  const [autoSimMode, setAutoSimMode] = useState(true);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.warn("Camera inaccessible, running in simulation mode.");
        setHasPermission(false);
      }
    }
    setupCamera();
  }, []);

  // Neural HUD Drawing logic (The "Sensing" visuals)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let t = 0;

    const renderSensing = () => {
      t += 0.05;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      if (simFaceDetected) {
        const centerX = w / 2;
        const centerY = h * 0.45;
        const faceW = 80 + Math.sin(t * 0.5) * 2;
        const faceH = 110;

        // Face Tracker Box
        ctx.strokeStyle = driverState === DriverState.ALERT ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 10]);
        ctx.strokeRect(centerX - faceW / 2, centerY - faceH / 2, faceW, faceH);
        ctx.setLineDash([]);

        // Eye Focus Points
        const eyeLX = centerX - 25;
        const eyeRX = centerX + 25;
        const eyeY = centerY - 15;

        [eyeLX, eyeRX].forEach(ex => {
          // Circular Tracker
          ctx.beginPath();
          ctx.arc(ex, eyeY, 12, 0, Math.PI * 2);
          ctx.stroke();
          
          if (simEyesOpen) {
            // "Iris" locked dot
            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.arc(ex + Math.cos(t) * 3, eyeY + Math.sin(t) * 3, 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Closed eye marker
            ctx.fillStyle = '#f00';
            ctx.fillRect(ex - 8, eyeY - 1, 16, 2);
          }
        });

        // Neural Mesh Connections
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 + t * 0.2;
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(ang) * 90, centerY + Math.sin(ang) * 90);
        }
        ctx.stroke();
      }

      frameId = requestAnimationFrame(renderSensing);
    };

    renderSensing();
    return () => cancelAnimationFrame(frameId);
  }, [simFaceDetected, simEyesOpen, driverState]);

  // Automated detection events for simulation demo
  useEffect(() => {
    if (!autoSimMode) return;
    const eventTimer = setInterval(() => {
      const r = Math.random();
      if (r > 0.95) setSimEyesOpen(false); // Drowsy trigger
      else if (r > 0.85) setSimEyesOpen(true);
      
      if (r < 0.03) setSimFaceDetected(false); // Out of frame
      else if (r > 0.08) setSimFaceDetected(true);
    }, 4500);
    return () => clearInterval(eventTimer);
  }, [autoSimMode]);

  useEffect(() => {
    const updateMetrics = setInterval(() => {
      const score = driverState === DriverState.ALERT ? 99 - Math.random() * 5 : 
                    driverState === DriverState.DISTRACTED ? 40 + Math.random() * 10 :
                    driverState === DriverState.DROWSY ? 15 + Math.random() * 5 : 5;

      onMetricsChange({
        eyesOpen: simEyesOpen,
        faceDetected: simFaceDetected,
        headPose: 'forward',
        blinkDuration: 0.12,
        readinessScore: score
      });
    }, 500);
    return () => clearInterval(updateMetrics);
  }, [simEyesOpen, simFaceDetected, onMetricsChange, driverState]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-orbitron text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Driver State Sensing</h3>
        <div className="flex items-center gap-1.5 bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[8px] text-cyan-400 font-bold">AI_LINK_STABLE</span>
        </div>
      </div>
      
      <div className="w-full aspect-video bg-black rounded-xl border border-white/10 overflow-hidden relative shadow-2xl">
        {/* Real Camera Feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-all duration-1000 ${
            hasPermission ? 'opacity-50 grayscale brightness-110' : 'opacity-10'
          }`} 
        />
        
        {/* Visual Sensing Overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* HUD Data */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 font-mono text-[7px] text-cyan-400 uppercase">
           <div className="flex justify-between items-start">
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 p-1.5 rounded space-y-0.5">
                 <div>Gaze_ID: Locked</div>
                 <div>Facial_Mesh: Active</div>
              </div>
              <div className={`px-2 py-1 rounded border ${
                simEyesOpen ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-red-500/30 border-red-500/50 text-red-400'
              }`}>
                Eyes: {simEyesOpen ? 'OPEN' : 'CLOSED'}
              </div>
           </div>

           <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <div>AI Core: Delta-9</div>
                <div className="w-16 h-0.5 bg-cyan-900 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-400 animate-[loading_3s_linear_infinite]" style={{width: '70%'}} />
                </div>
              </div>
              <div className="text-right">
                <div>{new Date().toLocaleTimeString()}</div>
                <div className="text-gray-500 italic">Sensing Active...</div>
              </div>
           </div>
        </div>

        {!hasPermission && hasPermission !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-20">
             <div className="text-center">
                <p className="text-[10px] text-gray-500 font-mono tracking-widest mb-2">EXTERNAL SENSOR OFFLINE</p>
                <p className="text-[8px] text-cyan-500 font-mono animate-pulse">RUNNING INTERNAL MODEL SIMULATION</p>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
         <button onClick={() => setSimEyesOpen(!simEyesOpen)} className={`py-1.5 rounded text-[8px] font-bold border transition-all ${
           simEyesOpen ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
         }`}>
           TOGGLE EYES: {simEyesOpen ? 'OPEN' : 'CLOSED'}
         </button>
         <button onClick={() => setAutoSimMode(!autoSimMode)} className={`py-1.5 rounded text-[8px] font-bold border transition-all ${
           autoSimMode ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 hover:bg-blue-600/30' : 'bg-white/5 text-gray-600 border-white/10 hover:bg-white/10'
         }`}>
           AI SIMULATION: {autoSimMode ? 'AUTO' : 'MANUAL'}
         </button>
      </div>
    </div>
  );
};

export default DriverMonitor;
