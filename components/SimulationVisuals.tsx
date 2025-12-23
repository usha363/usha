
import React, { useRef, useEffect } from 'react';
import { DriveMode } from '../types';

interface SimulationVisualsProps {
  speed: number;
  mode: DriveMode;
  isDistracted: boolean;
  isEmergency: boolean;
  isBraking: boolean;
}

const SimulationVisuals: React.FC<SimulationVisualsProps> = ({ speed, mode, isDistracted, isEmergency, isBraking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const offsetRef = useRef(0);
  const driftRef = useRef(0);
  const vibrationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;

      // Realistic vibration increases with speed
      vibrationRef.current = (speed / 80) * (Math.random() - 0.5) * 1.2;

      // Handle Lane Drift (Simulate pulling over in emergency or slight sway in manual)
      if (isEmergency && speed > 0) {
        driftRef.current = Math.min(driftRef.current + 0.0025, 0.4); 
      } else if (!isEmergency) {
        driftRef.current = Math.max(driftRef.current - 0.008, 0);
      }

      const horizon = h * 0.42;
      const roadWidthBottom = w * 1.5;
      const roadWidthTop = w * 0.12;
      const centerX = w / 2 - (driftRef.current * w);

      // 1. SKY & ENVIRONMENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
      skyGrad.addColorStop(0, '#020205');
      skyGrad.addColorStop(1, '#08081a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. ROAD BASE (3D PERSPECTIVE)
      const roadGrad = ctx.createLinearGradient(0, horizon, 0, h);
      roadGrad.addColorStop(0, '#0a0a0f');
      roadGrad.addColorStop(1, '#111111');
      ctx.fillStyle = roadGrad;
      
      ctx.beginPath();
      ctx.moveTo(centerX - roadWidthTop / 2, horizon);
      ctx.lineTo(centerX + roadWidthTop / 2, horizon);
      ctx.lineTo(centerX + roadWidthBottom / 2, h);
      ctx.lineTo(centerX - roadWidthBottom / 2, h);
      ctx.fill();

      // Road Borders (Glowing edge)
      ctx.strokeStyle = isEmergency ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // 3. ANIMATED ROAD MARKINGS (Dynamic Speed)
      offsetRef.current += speed * 0.3; // Speed affects movement
      const spacing = 180;
      if (offsetRef.current > spacing) offsetRef.current = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 22; i++) {
        const z = (i * spacing - offsetRef.current) / h;
        if (z < 0) continue;
        const yPos = horizon + Math.pow(z, 2.5) * (h - horizon);
        const nextY = horizon + Math.pow(z + 0.1, 2.5) * (h - horizon);
        
        ctx.lineWidth = (yPos - horizon) / 18;
        ctx.beginPath();
        ctx.moveTo(centerX, yPos);
        ctx.lineTo(centerX, nextY);
        ctx.stroke();
      }

      // 4. DETAILED VEHICLE RENDER (Realistic Top-Down)
      const carW = 150;
      const carH = 280;
      // Vehicle is fixed vertically, road and effects move
      const carX = w / 2 - carW / 2 + vibrationRef.current;
      const carY = h * 0.65;

      ctx.save();
      
      // Ground Shadow
      ctx.shadowBlur = 50;
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowOffsetY = 20;

      // Chassis - Base Layer
      ctx.fillStyle = '#080808';
      ctx.beginPath();
      ctx.roundRect(carX, carY, carW, carH, 40);
      ctx.fill();

      // Chassis - Body Gradient
      const bodyGrad = ctx.createLinearGradient(carX, carY, carX + carW, carY);
      bodyGrad.addColorStop(0, '#0f0f0f');
      bodyGrad.addColorStop(0.5, '#1e1e1e');
      bodyGrad.addColorStop(1, '#0f0f0f');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(carX + 8, carY + 8, carW - 16, carH - 16, 35);
      ctx.fill();

      // Aerodynamic details (Lines on hood)
      ctx.strokeStyle = '#252525';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(carX + 40, carY + 20); ctx.lineTo(carX + 40, carY + 80);
      ctx.moveTo(carX + carW - 40, carY + 20); ctx.lineTo(carX + carW - 40, carY + 80);
      ctx.stroke();

      // Windshield & Roof (Realistic Reflection)
      const glassGrad = ctx.createLinearGradient(carX, carY + 60, carX, carY + 140);
      glassGrad.addColorStop(0, 'rgba(40, 45, 60, 0.9)');
      glassGrad.addColorStop(1, 'rgba(10, 10, 15, 0.95)');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(carX + 20, carY + 55, carW - 40, 75, 12);
      ctx.fill();
      
      // Interior HUD Reflection (Small blue glow)
      ctx.fillStyle = isEmergency ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(carX + 35, carY + 115, carW - 70, 4, 2);
      ctx.fill();

      // Wheels (Partially visible)
      ctx.fillStyle = '#050505';
      ctx.fillRect(carX - 12, carY + 50, 15, 50); // Front L
      ctx.fillRect(carX + carW - 3, carY + 50, 15, 50); // Front R
      ctx.fillRect(carX - 12, carY + carH - 100, 15, 50); // Rear L
      ctx.fillRect(carX + carW - 3, carY + carH - 100, 15, 50); // Rear R

      // Modern Taillights (Bar Style)
      const tailBrightness = isBraking ? 1.0 : 0.4;
      ctx.shadowBlur = isBraking ? 40 : 15;
      ctx.shadowColor = 'red';
      ctx.fillStyle = `rgba(255, 0, 0, ${tailBrightness})`;
      ctx.beginPath();
      ctx.roundRect(carX + 15, carY + carH - 30, 45, 12, 6);
      ctx.roundRect(carX + carW - 60, carY + carH - 30, 45, 12, 6);
      ctx.fill();

      // Headlight Projection Beams
      if (speed > 1) {
        ctx.globalCompositeOperation = 'lighter';
        const beamColor = isEmergency ? '255,0,0' : '0,255,255';
        const headGrad = ctx.createLinearGradient(0, carY + 40, 0, carY - 300);
        headGrad.addColorStop(0, `rgba(${beamColor}, 0.2)`);
        headGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = headGrad;
        
        // Dynamic angle based on vibration/steering
        const beamAngle = vibrationRef.current * 0.05;
        
        // Left Beam
        ctx.beginPath();
        ctx.moveTo(carX + 25, carY + 40);
        ctx.lineTo(carX - 100 + beamAngle * 100, carY - 300);
        ctx.lineTo(carX + 60 + beamAngle * 100, carY - 300);
        ctx.fill();
        
        // Right Beam
        ctx.beginPath();
        ctx.moveTo(carX + carW - 25, carY + 40);
        ctx.lineTo(carX + carW + 100 + beamAngle * 100, carY - 300);
        ctx.lineTo(carX + carW - 60 + beamAngle * 100, carY - 300);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();

      // 5. MOTION BLUR & SPEED EFFECTS
      if (speed > 90) {
        const blurGrad = ctx.createRadialGradient(w/2, h/2, w/3, w/2, h/2, w);
        blurGrad.addColorStop(0, 'transparent');
        blurGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = blurGrad;
        ctx.fillRect(0, 0, w, h);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current!);
  }, [speed, mode, isDistracted, isEmergency, isBraking]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
       <canvas ref={canvasRef} className="w-full h-full block" />
       {/* Cinematic Vignettes */}
       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none" />
       <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default SimulationVisuals;
