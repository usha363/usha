
import React from 'react';
import { SystemLog } from '../types';

interface SystemLogPanelProps {
  logs: SystemLog[];
}

const SystemLogPanel: React.FC<SystemLogPanelProps> = ({ logs }) => {
  return (
    <div className="flex flex-col gap-2 h-48">
      <h3 className="font-orbitron text-[10px] text-gray-400 uppercase flex justify-between">
        AI Decision Stream
        <span className="text-green-500">Encrypted</span>
      </h3>
      <div className="flex-1 bg-black/60 rounded-xl border border-white/10 p-3 overflow-y-auto font-mono text-[9px] space-y-2">
        {logs.map(log => (
          <div key={log.id} className={`flex gap-2 border-l-2 pl-2 ${
            log.type === 'critical' ? 'border-red-500 bg-red-500/5' : 
            log.type === 'warning' ? 'border-orange-500 bg-orange-500/5' : 'border-cyan-500 bg-cyan-500/5'
          }`}>
            <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className={
              log.type === 'critical' ? 'text-red-400 font-bold' : 
              log.type === 'warning' ? 'text-orange-400' : 'text-cyan-400'
            }>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-gray-600 italic">Initializing data stream...</div>}
      </div>
    </div>
  );
};

export default SystemLogPanel;
