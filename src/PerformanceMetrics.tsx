import { CarSpecs } from './types';
import { Activity } from 'lucide-react';

// Every value in ENGINES / BODY_KITS (src/types.ts) needs an entry here — a missing
// key silently falls back to the V8 / Sleek Touring numbers and shows wrong stats.
const engineStats: Record<string, { hp: number; base0to60: number }> = {
  'V8 Twin-Turbo': { hp: 720, base0to60: 2.8 },
  'V10 Naturally Aspirated': { hp: 640, base0to60: 3.0 },
  'V12 Hyper-hybrid': { hp: 1050, base0to60: 2.3 },
  'Quad-Motor Electric': { hp: 1914, base0to60: 1.85 },
  'Boxer-6 Turbo': { hp: 580, base0to60: 3.1 },
  'Hydrogen Fuel Cell': { hp: 670, base0to60: 2.9 },
};

const aeroStats: Record<string, { cd: number; timeMod: number }> = {
  'Aggressive Aero': { cd: 0.35, timeMod: 0.05 },
  'Sleek Touring': { cd: 0.28, timeMod: 0 },
  'Widebody Track': { cd: 0.38, timeMod: -0.15 },
  'Minimalist Concept': { cd: 0.22, timeMod: 0.1 },
  'Vintage Rally': { cd: 0.42, timeMod: -0.1 },
  'Cyber-Street': { cd: 0.34, timeMod: -0.05 },
};

export default function PerformanceMetrics({ specs }: { specs: CarSpecs }) {
  const eStats = engineStats[specs.engine] || engineStats['V8 Twin-Turbo'];
  const aStats = aeroStats[specs.bodyKit] || aeroStats['Sleek Touring'];

  const hp = eStats.hp;
  const time = (eStats.base0to60 + aStats.timeMod).toFixed(2);
  const cd = aStats.cd.toFixed(2);

  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-[#1f1f1f]">
      <div className="flex items-center space-x-2">
        <Activity className="w-4 h-4 text-[#888]" />
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#666]">Telemetry & Performance</h3>
      </div>
      <div className="space-y-2">
        <div className="p-3 bg-[#111] border border-[#222] rounded flex justify-between items-center">
          <div className="text-[10px] text-[#666] uppercase tracking-[0.1em]">Peak Power</div>
          <div className="text-xs text-white font-mono">{hp} BHP</div>
        </div>
        <div className="p-3 bg-[#111] border border-[#222] rounded flex justify-between items-center">
          <div className="text-[10px] text-[#666] uppercase tracking-[0.1em]">0-60 MPH</div>
          <div className="text-xs text-white font-mono">{time}s</div>
        </div>
        <div className="p-3 bg-[#111] border border-[#222] rounded flex justify-between items-center">
          <div className="text-[10px] text-[#666] uppercase tracking-[0.1em]">Drag (Cd)</div>
          <div className="text-xs text-white font-mono">{cd}</div>
        </div>
      </div>
    </div>
  );
}
