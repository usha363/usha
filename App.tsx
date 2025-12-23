
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DriverState, DriveMode, RoadType, TORUrgency, SystemLog, DriverMetrics, EmergencyContext } from './types';
import DriverMonitor from './components/DriverMonitor';
import SimulationVisuals from './components/SimulationVisuals';
import Dashboard from './components/Dashboard';
import GpsMap from './components/GpsMap';
import AlertOverlay from './components/AlertOverlay';
import SystemLogPanel from './components/SystemLogPanel';
import AIInsights from './components/AIInsights';

const App: React.FC = () => {
  const [mode, setMode] = useState<DriveMode>(DriveMode.MANUAL);
  const [driverState, setDriverState] = useState<DriverState>(DriverState.ALERT);
  const [speed, setSpeed] = useState(80);
  const [targetSpeed, setTargetSpeed] = useState(80);
  const [roadType, setRoadType] = useState<RoadType>(RoadType.HIGHWAY);
  const [torUrgency, setTorUrgency] = useState<TORUrgency>(TORUrgency.NONE);
  const [hazardsActive, setHazardsActive] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [emergencyContext, setEmergencyContext] = useState<EmergencyContext>({
    hospitalName: "Saint Mary's Medical Center",
    distance: "1.2km",
    contactName: "Family Emergency Line",
    isCalling: false
  });

  const [metrics, setMetrics] = useState<DriverMetrics>({
    eyesOpen: true,
    faceDetected: true,
    headPose: 'forward',
    blinkDuration: 0,
    readinessScore: 100
  });

  const stateStartTime = useRef<number>(Date.now());
  const lastVoiceMsg = useRef<string>("");

  const speak = (text: string) => {
    if (text === lastVoiceMsg.current) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.85;
    window.speechSynthesis.speak(utterance);
    lastVoiceMsg.current = text;
  };

  const addLog = useCallback((message: string, type: 'info' | 'warning' | 'critical' = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    }, ...prev.slice(0, 19)]);
  }, []);

  // Main AI Logic Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const stateDuration = (now - stateStartTime.current) / 1000;

      let nextState = DriverState.ALERT;
      let nextMode = mode;
      let nextTargetSpeed = targetSpeed;
      let nextUrgency = TORUrgency.NONE;

      // 1. Driver State Detection Logic
      if (!metrics.faceDetected) {
        nextState = stateDuration > 3 ? DriverState.UNRESPONSIVE : DriverState.DISTRACTED;
      } else if (!metrics.eyesOpen) {
        nextState = stateDuration > 2.5 ? DriverState.DROWSY : DriverState.ALERT;
      } else if (metrics.headPose !== 'forward') {
        nextState = DriverState.DISTRACTED;
      }

      if (nextState !== driverState) {
        setDriverState(nextState);
        stateStartTime.current = now;
      }

      // 2. Behavioral Response & Automated Actions
      if (nextState === DriverState.UNRESPONSIVE || nextState === DriverState.DROWSY) {
        if (nextMode !== DriveMode.EMERGENCY_CONTROL) {
          nextMode = DriveMode.EMERGENCY_CONTROL;
          nextUrgency = TORUrgency.HIGH;
          setHazardsActive(true);
          setEmergencyContext(prev => ({ ...prev, isCalling: true }));
          addLog(`CRITICAL: Driver ${nextState} detected. Taking control.`, 'critical');
          speak(`Critical emergency. Driver unresponsive. Initiating safe stop and alerting ${emergencyContext.hospitalName}. Contacting your emergency contact now.`);
        }
        nextTargetSpeed = Math.max(0, speed - 10);
      } else if (nextState === DriverState.DISTRACTED) {
        nextUrgency = speed > 40 ? TORUrgency.MEDIUM : TORUrgency.LOW;
        if (stateDuration > 5 && mode === DriveMode.MANUAL) {
          speak("Warning: Driver distraction detected. Please focus on the road.");
          addLog("Driver gaze shifted for > 5s.", "warning");
        }
      } else {
        if (mode !== DriveMode.EMERGENCY_CONTROL) {
          setHazardsActive(false);
          setEmergencyContext(prev => ({ ...prev, isCalling: false }));
        }
      }

      if (nextMode === DriveMode.EMERGENCY_CONTROL && speed < 1) {
        nextTargetSpeed = 0;
        if (speed === 0) {
          addLog(`Vehicle Safely Parked. Emergency responders notified.`, "info");
        }
      }

      if (nextMode !== mode) setMode(nextMode);
      if (nextTargetSpeed !== targetSpeed) setTargetSpeed(nextTargetSpeed);
      if (nextUrgency !== torUrgency) setTorUrgency(nextUrgency);

    }, 300);

    return () => clearInterval(interval);
  }, [driverState, metrics, mode, speed, targetSpeed, addLog, emergencyContext.hospitalName]);

  // Speed Smoothing
  useEffect(() => {
    const speedInterval = setInterval(() => {
      setSpeed(prev => {
        if (Math.abs(prev - targetSpeed) < 0.2) return targetSpeed;
        return prev + (targetSpeed > prev ? 0.3 : -0.7);
      });
    }, 50);
    return () => clearInterval(speedInterval);
  }, [targetSpeed]);

  return (
    <div className={`relative w-full h-screen bg-[#050505] text-white flex flex-col overflow-hidden transition-colors duration-1000 ${
      mode === DriveMode.EMERGENCY_CONTROL ? 'bg-red-950/20' : ''
    }`}>
      {/* HUD Scanner Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 border-[10px] border-white/5 opacity-50" />
      
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            mode === DriveMode.EMERGENCY_CONTROL ? 'bg-red-500 shadow-[0_0_30px_red]' : 'bg-cyan-500 shadow-[0_0_20px_cyan]'
          }`}>
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-orbitron text-xl tracking-[0.2em]">INTELLIDRIVE <span className="text-cyan-400">3D</span></h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">AI PILOT</span>
            <span className={`font-orbitron text-sm font-bold tracking-widest ${
              mode === DriveMode.EMERGENCY_CONTROL ? 'text-red-500 animate-pulse' : 'text-cyan-400'
            }`}>{mode}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">ROAD CONTEXT</span>
            <span className="font-orbitron text-sm text-blue-300">{roadType}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-md p-4 flex flex-col gap-4 z-40">
          <DriverMonitor onMetricsChange={setMetrics} driverState={driverState} />
          <AIInsights metrics={metrics} driverState={driverState} speed={speed} />
          <div className="mt-auto">
            <SystemLogPanel logs={logs} />
          </div>
        </div>

        <div className="flex-1 relative flex flex-col bg-black">
          <SimulationVisuals 
            speed={speed} 
            mode={mode} 
            isDistracted={driverState === DriverState.DISTRACTED} 
            isEmergency={mode === DriveMode.EMERGENCY_CONTROL}
            isBraking={speed < targetSpeed}
          />
          
          <div className="absolute bottom-0 w-full p-8 z-30">
            <Dashboard 
              speed={speed} 
              targetSpeed={targetSpeed} 
              mode={mode} 
              driverState={driverState}
              torUrgency={torUrgency}
              hazardsActive={hazardsActive}
            />
          </div>

          <AlertOverlay 
            urgency={torUrgency} 
            message={
              mode === DriveMode.EMERGENCY_CONTROL ? "AI EMERGENCY CONTROL ACTIVE" :
              torUrgency === TORUrgency.HIGH ? "IMMEDIATE TAKEOVER REQUIRED!" :
              torUrgency === TORUrgency.MEDIUM ? "ATTENTION REQUIRED" : ""
            } 
          />

          {emergencyContext.isCalling && (
             <div className="absolute top-10 right-10 bg-red-600/90 text-white p-4 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                </div>
                <div>
                   <div className="text-[10px] font-bold uppercase">Emergency Call Active</div>
                   <div className="font-orbitron text-xs">DIALING: {emergencyContext.contactName}</div>
                </div>
             </div>
          )}
        </div>

        <div className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-md p-4 flex flex-col gap-4 z-40">
           <GpsMap 
             onContextChange={setRoadType} 
             mode={mode} 
             isEmergency={mode === DriveMode.EMERGENCY_CONTROL} 
             hospitalName={emergencyContext.hospitalName}
             distance={emergencyContext.distance}
           />
           
           <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4">
             <h3 className="font-orbitron text-[10px] text-gray-400 uppercase mb-3">Health & Biometrics</h3>
             <div className="space-y-4">
                <MetricBar label="Pulse Rate" value="72 BPM" progress={72} />
                <MetricBar label="Oxygen" value="98%" progress={98} />
                <MetricBar label="Cognitive Load" value="Optimal" progress={20} />
                <div className="pt-4 border-t border-white/10">
                   <span className="text-[10px] text-gray-500 uppercase">Alert Level: {torUrgency}</span>
                   <div className={`mt-2 h-1 w-full rounded-full ${torUrgency === TORUrgency.HIGH ? 'bg-red-500' : 'bg-cyan-500'}`} />
                </div>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
};

const MetricBar = ({ label, value, progress }: any) => (
  <div>
    <div className="flex justify-between text-[10px] mb-1">
      <span className="text-gray-500 uppercase">{label}</span>
      <span className="text-cyan-400 font-bold">{value}</span>
    </div>
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export default App;
