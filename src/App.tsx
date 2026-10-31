import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Car, Download, Share2, Layers, Cpu, PaintBucket, MountainSnow, Palette, Save, History, X, Clock, Play, Columns, Glasses, FileText } from 'lucide-react';
import { ENGINES, BODY_KITS, COLORS, STYLES, ENVIRONMENTS, CarSpecs } from './types';
import { playEngineSound } from './audio';
import jsPDF from 'jspdf';
import CarPreview from './Car3D';
import PerformanceMetrics from './PerformanceMetrics';

export default function App() {
  const [specs, setSpecs] = useState<CarSpecs>({
    engine: ENGINES[0],
    bodyKit: BODY_KITS[0],
    color: COLORS[0],
    style: STYLES[0],
    environment: ENVIRONMENTS[0],
  });

  const [versions, setVersions] = useState<Array<{ id: string; timestamp: Date; specs: CarSpecs }>>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [compareSpecs, setCompareSpecs] = useState<CarSpecs | null>(null);
  const [activeConfig, setActiveConfig] = useState<'primary' | 'secondary'>('primary');

  const [presets, setPresets] = useState<Array<{ name: string; specs: CarSpecs }>>([
    { name: 'Track Monster', specs: { engine: 'V10 Naturally Aspirated', bodyKit: 'Aggressive Aero', color: 'Midnight Black', style: 'Carbon Fiber Weave', environment: 'Neon City Streets', ambientIntensity: 0.4 } },
    { name: 'Eco Future', specs: { engine: 'Quad-Motor Electric', bodyKit: 'Minimalist Concept', color: 'Pearl White', style: 'Satin Matte', environment: 'Minimalist Studio', ambientIntensity: 0.8 } }
  ]);

  const currentSpecs = (isCompareMode && activeConfig === 'secondary' && compareSpecs) ? compareSpecs : specs;

  const updateSpecs = (updater: (s: CarSpecs) => CarSpecs) => {
    if (isCompareMode && activeConfig === 'secondary') {
      setCompareSpecs(s => s ? updater(s) : s);
    } else {
      setSpecs(updater);
    }
  };

  const handleSavePreset = () => {
    const name = `${currentSpecs.color.split(' ')[0]} ${currentSpecs.engine.split(' ')[0]}`;
    setPresets(prev => [...prev, { name: `${name} ${prev.length + 1}`, specs: { ...currentSpecs } }]);
  };

  const handleToggleCompare = () => {
    if (isCompareMode) {
      setIsCompareMode(false);
      setActiveConfig('primary');
      setCompareSpecs(null);
    } else {
      setIsCompareMode(true);
      setIsVRMode(false);
      setCompareSpecs({ ...specs, color: COLORS[1] }); // Default to another color for clear distinction
      setActiveConfig('secondary');
    }
  };

  const handleToggleVR = () => {
    if (isVRMode) {
      setIsVRMode(false);
    } else {
      setIsVRMode(true);
      setIsCompareMode(false);
      setActiveConfig('primary');
      setCompareSpecs(null);
    }
  };

  const handleSaveVersion = () => {
    const newVersion = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      specs: { ...specs },
    };
    setVersions(prev => [newVersion, ...prev]);
  };

  const handleRestoreVersion = (versionSpecs: CarSpecs) => {
    setSpecs(versionSpecs);
    setIsHistoryModalOpen(false);
  };

  // Every mounted preview has a unique canvas id; exports must target the ACTIVE
  // configuration's canvas, not whichever duplicate id the DOM returns first.
  const getActiveCanvas = () => {
    const canvasId = isVRMode
      ? 'car-canvas-left'
      : isCompareMode && activeConfig === 'secondary'
        ? 'car-canvas-secondary'
        : 'car-canvas-primary';
    return document.getElementById(canvasId) as HTMLCanvasElement | null;
  };

  const handleShare = async () => {
    const summary = `AERO.STUDIO build — Engine: ${currentSpecs.engine} | Body: ${currentSpecs.bodyKit} | Color: ${currentSpecs.color} | Style: ${currentSpecs.style} | Environment: ${currentSpecs.environment}`;
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // Clipboard unavailable (permissions or insecure context); no sensible fallback.
    }
  };

  const handleExportPDF = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const imageUrl = canvas.toDataURL('image/png');

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600]
    });
    
    doc.setFillColor(5, 5, 5); // #050505
    doc.rect(0, 0, 800, 600, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('AERO.STUDIO - Design Portfolio', 40, 50);
    
    doc.setFontSize(14);
    doc.setTextColor(136, 136, 136); // #888888
    doc.text(`Engine: ${currentSpecs.engine}`, 40, 80);
    doc.text(`Body Kit: ${currentSpecs.bodyKit}`, 40, 100);
    doc.text(`Color: ${currentSpecs.color}`, 40, 120);
    doc.text(`Style: ${currentSpecs.style}`, 40, 140);
    doc.text(`Environment: ${currentSpecs.environment}`, 40, 160);

    if (currentSpecs.notes) {
      doc.text('Design Notes:', 350, 80);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(12);
      const splitNotes = doc.splitTextToSize(currentSpecs.notes, 400);
      doc.text(splitNotes, 350, 100);
    }
    
    doc.addImage(imageUrl, 'PNG', 40, 200, 720, 360, 'carImage', 'FAST');
    
    doc.save('supercar-design.pdf');
  };

  const handleExportImage = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const imageUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `supercar-${currentSpecs.color.replace(/\s+/g, '-').toLowerCase()}-${currentSpecs.bodyKit.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden">
      
      {/* Sidebar Configurator */}
      {!isVRMode && (
        <aside className="w-80 flex-shrink-0 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-[#1f1f1f] flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-[0.2em] text-white serif">AERO.STUDIO</h1>
              <p className="text-[10px] text-[#666] uppercase tracking-[0.2em]">Pro Supercar Configurator</p>
            </div>
          </div>

        <div className="flex-1 p-6 space-y-8">
          
          <ConfigSection title="Saved Presets" icon={<Save className="w-4 h-4 text-[#888]" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => updateSpecs(() => ({ ...preset.specs }))}
                    className="flex flex-col text-left px-3 py-2 rounded border bg-[#111] border-[#222] hover:border-[#444] transition-all group"
                  >
                    <span className="text-[10px] uppercase font-bold text-white mb-1 group-hover:text-[#00ff00] transition-colors">{preset.name}</span>
                    <span className="text-[9px] text-[#666] font-mono">{preset.specs.engine} | {preset.specs.color}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={handleSavePreset}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] text-[#888] text-[10px] uppercase font-bold rounded hover:text-white hover:border-[#888] transition-all"
              >
                <Save className="w-3 h-3" />
                <span>Save Current as Preset</span>
              </button>
            </div>
          </ConfigSection>

          <ConfigSection title="Design Notes" icon={<FileText className="w-4 h-4 text-[#888]" />}>
            <textarea
              value={currentSpecs.notes || ''}
              onChange={(e) => updateSpecs(s => ({ ...s, notes: e.target.value }))}
              placeholder="Add your design notes here..."
              className="w-full h-24 bg-[#111] border border-[#222] text-[#e0e0e0] text-xs p-3 rounded focus:outline-none focus:border-[#444] resize-none transition-colors"
            />
          </ConfigSection>

          <ConfigSection title="Power Unit Dynamics" icon={<Cpu className="w-4 h-4 text-[#888]" />}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-[#555] uppercase tracking-[0.1em]">Engine Selection</span>
              <button 
                onClick={() => playEngineSound(currentSpecs.engine)}
                className="flex items-center space-x-1.5 px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[#00ff00] text-[9px] uppercase font-bold rounded hover:bg-[#222] hover:border-[#00ff00] transition-all"
                title="Simulate Engine Sound"
              >
                <Play className="w-3 h-3" fill="currentColor" />
                <span>Rev Engine</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {ENGINES.map(engine => (
                <button
                  key={engine}
                  onClick={() => {
                    updateSpecs(s => ({ ...s, engine }));
                    playEngineSound(engine);
                  }}
                  className={`text-left px-3 py-2 rounded text-[10px] uppercase font-bold transition-all border ${currentSpecs.engine === engine ? 'bg-white border-white text-black' : 'bg-[#111] border-[#222] text-[#888] hover:text-white'}`}
                >
                  {engine}
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Aerodynamic Profile" icon={<Layers className="w-4 h-4 text-[#888]" />}>
            <div className="grid grid-cols-1 gap-2">
              {BODY_KITS.map(kit => (
                <button
                  key={kit}
                  onClick={() => updateSpecs(s => ({ ...s, bodyKit: kit }))}
                  className={`text-left px-3 py-2 rounded text-[10px] uppercase font-bold transition-all border ${currentSpecs.bodyKit === kit ? 'bg-white border-white text-black' : 'bg-[#111] border-[#222] text-[#888] hover:text-white'}`}
                >
                  {kit}
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Exterior Finish" icon={<PaintBucket className="w-4 h-4 text-[#888]" />}>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateSpecs(s => ({ ...s, color }))}
                  className={`px-3 py-2 rounded text-[10px] uppercase font-bold transition-all border ${currentSpecs.color === color ? 'bg-white border-white text-black' : 'bg-[#111] border-[#222] text-[#888] hover:text-white'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Design Concept" icon={<Palette className="w-4 h-4 text-[#888]" />}>
            <div className="grid grid-cols-1 gap-2">
              {STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => updateSpecs(s => ({ ...s, style }))}
                  className={`text-left px-3 py-2 rounded text-[10px] uppercase font-bold transition-all border ${currentSpecs.style === style ? 'bg-white border-white text-black' : 'bg-[#111] border-[#222] text-[#888] hover:text-white'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Render Environment" icon={<MountainSnow className="w-4 h-4 text-[#888]" />}>
            <div className="space-y-4">
               <div>
                 <span className="text-[10px] text-[#555] uppercase tracking-[0.1em] block mb-2">Scene Background</span>
                 <select
                    value={currentSpecs.environment}
                    onChange={(e) => updateSpecs(s => ({ ...s, environment: e.target.value }))}
                    className="w-full bg-[#111] border border-[#222] text-white text-sm font-mono rounded px-3 py-2.5 outline-none focus:border-[#444]"
                 >
                    {ENVIRONMENTS.map(env => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                 </select>
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-[#555] uppercase tracking-[0.1em]">Ambient Lighting</span>
                   <span className="text-[10px] text-white font-mono">{(currentSpecs.ambientIntensity ?? 0.4).toFixed(2)}</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="2" 
                   step="0.05"
                   value={currentSpecs.ambientIntensity ?? 0.4}
                   onChange={(e) => updateSpecs(s => ({ ...s, ambientIntensity: parseFloat(e.target.value) }))}
                   className="w-full accent-white"
                 />
               </div>
            </div>
          </ConfigSection>

          <PerformanceMetrics specs={currentSpecs} />

        </div>
      </aside>
      )}

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        
        {/* Top bar */}
        <header className="h-16 border-b border-[#1f1f1f] bg-[#0a0a0a] px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-[10px] text-[#444] uppercase tracking-tighter">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>SECURED & ENCRYPTED</span>
             </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <button 
               onClick={handleToggleVR}
               className={`flex items-center space-x-2 px-3 py-1.5 border text-[10px] uppercase font-bold rounded transition-all ${isVRMode ? 'bg-white border-white text-black' : 'bg-[#111] border-[#222] text-[#888] hover:text-white'}`}
             >
               <Glasses className="w-3 h-3" />
               <span>VR Mode</span>
             </button>
             <button 
               onClick={handleToggleCompare}
               className={`flex items-center space-x-2 px-3 py-1.5 border text-[10px] uppercase font-bold rounded transition-all ${isCompareMode ? 'bg-white border-white text-black' : 'bg-[#111] border-[#222] text-[#888] hover:text-white'}`}
             >
               <Columns className="w-3 h-3" />
               <span>Compare</span>
             </button>
             <button 
               onClick={handleSaveVersion}
               className="flex items-center space-x-2 px-3 py-1.5 bg-[#111] border border-[#222] text-[#888] text-[10px] uppercase font-bold rounded hover:text-white transition-all"
             >
               <Save className="w-3 h-3" />
               <span>Save Snapshot</span>
             </button>
             <button 
               onClick={() => setIsHistoryModalOpen(true)}
               className="flex items-center space-x-2 px-3 py-1.5 bg-[#111] border border-[#222] text-[#888] text-[10px] uppercase font-bold rounded hover:text-white transition-all relative"
             >
               <History className="w-3 h-3" />
               <span>History</span>
               {versions.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                   {versions.length}
                 </span>
               )}
             </button>
             <div className="w-px h-6 bg-[#222] mx-2"></div>
             <button onClick={handleShare} className="flex items-center space-x-2 px-3 py-1.5 bg-[#111] border border-[#222] text-[#888] text-[10px] uppercase font-bold rounded hover:text-white transition-all">
               <Share2 className="w-3 h-3" />
               <span>Share Project</span>
             </button>
             <div className="flex space-x-2">
               <button 
                onClick={handleExportImage}
                className="flex items-center space-x-2 px-3 py-1.5 bg-[#111] border border-[#222] text-[#888] text-[10px] uppercase font-bold rounded hover:text-white transition-all"
               >
                 <Download className="w-3 h-3" />
                 <span>PNG</span>
               </button>
               <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white text-black text-[10px] uppercase font-bold rounded shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-[#e0e0e0] transition-all"
               >
                 <Download className="w-3 h-3" />
                 <span>PDF Portfolio</span>
               </button>
             </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_center,_#181818_0%,_#050505_100%)]">
          
          {isVRMode ? (
            <div className="w-full h-full flex items-center justify-center bg-black gap-2 p-2 relative">
               <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-[#111] border border-[#333] text-white text-[10px] font-bold tracking-[0.2em] rounded uppercase shadow-2xl">
                 Stereoscopic VR Mode
               </div>
               {/* Left Eye */}
               <div className="w-1/2 h-full relative rounded-[3rem] overflow-hidden border-4 border-[#111] shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                 <CarPreview specs={specs} eye="left" id="car-canvas-left" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
               </div>
               {/* Right Eye */}
               <div className="w-1/2 h-full relative rounded-[3rem] overflow-hidden border-4 border-[#111] shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                 <CarPreview specs={specs} eye="right" id="car-canvas-right" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
               </div>
            </div>
          ) : isCompareMode ? (
            <div className="w-full h-full flex space-x-4">
              
              {/* Primary Config */}
              <div 
                onClick={() => setActiveConfig('primary')}
                className={`flex-1 relative rounded border bg-[#0a0a0a]/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all ${activeConfig === 'primary' ? 'border-[#888] ring-1 ring-[#888]' : 'border-[#222] opacity-50 cursor-pointer hover:opacity-80'}`}
              >
                <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-[#111] border border-[#333] text-white text-[10px] font-bold tracking-wider rounded uppercase">Config A</div>
                <CarPreview specs={specs} id="car-canvas-primary" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-[#888] uppercase mb-1">Project {specs.style.split(' ')[0]}</div>
                    <h2 className="text-xl font-light tracking-[0.2em] text-white serif italic uppercase">{specs.color}</h2>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] mb-1">Engine</div>
                     <div className="text-xs font-mono text-white">{specs.engine}</div>
                  </div>
                </div>
              </div>

              {/* Secondary Config */}
              <div 
                onClick={() => setActiveConfig('secondary')}
                className={`flex-1 relative rounded border bg-[#0a0a0a]/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all ${activeConfig === 'secondary' ? 'border-[#888] ring-1 ring-[#888]' : 'border-[#222] opacity-50 cursor-pointer hover:opacity-80'}`}
              >
                <div className="absolute top-4 right-4 z-10 px-2 py-1 bg-[#111] border border-[#333] text-white text-[10px] font-bold tracking-wider rounded uppercase">Config B</div>
                {compareSpecs && <CarPreview specs={compareSpecs} id="car-canvas-secondary" />}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-[#888] uppercase mb-1">Project {compareSpecs?.style.split(' ')[0]}</div>
                    <h2 className="text-xl font-light tracking-[0.2em] text-white serif italic uppercase">{compareSpecs?.color}</h2>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] mb-1">Engine</div>
                     <div className="text-xs font-mono text-white">{compareSpecs?.engine}</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="w-full h-full relative rounded border border-[#222] bg-[#0a0a0a]/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center">
              
              <CarPreview specs={specs} id="car-canvas-primary" />

              {/* Spec overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#888] uppercase mb-1">Project {specs.style.split(' ')[0]}</div>
                  <h2 className="text-3xl font-light tracking-[0.2em] text-white serif italic uppercase">{specs.color} Edition</h2>
                </div>
                <div className="flex space-x-6 text-right">
                   <div>
                     <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] mb-1">Engine</div>
                     <div className="text-xs font-mono text-white">{specs.engine}</div>
                   </div>
                   <div>
                     <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] mb-1">Aero</div>
                     <div className="text-xs font-mono text-white">{specs.bodyKit}</div>
                   </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <AnimatePresence>
        {isHistoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-[#222] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-[#1f1f1f] flex justify-between items-center bg-[#111]">
                <div className="flex items-center space-x-3">
                  <History className="w-4 h-4 text-[#888]" />
                  <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-white">Project Version History</h2>
                </div>
                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1 hover:bg-[#222] rounded transition-colors text-[#888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {versions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 text-[#333] mx-auto mb-4" />
                    <p className="text-sm text-[#666]">No saved versions yet.</p>
                    <p className="text-[10px] text-[#444] uppercase tracking-wider mt-2">Use "Save Snapshot" to record your progress.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version, idx) => (
                      <div 
                        key={version.id} 
                        className="p-4 border border-[#222] bg-[#111] rounded flex items-center justify-between hover:border-[#444] transition-colors"
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] text-[#888] uppercase tracking-[0.1em] font-mono">
                              {version.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="text-xs text-white font-bold">{version.specs.color} Edition</span>
                          </div>
                          <div className="flex space-x-4 text-[10px] text-[#666] font-mono">
                            <span>ENG: {version.specs.engine.split(' ')[0]}</span>
                            <span>AERO: {version.specs.bodyKit.split(' ')[0]}</span>
                            <span>ENV: {version.specs.environment.split(' ')[0]}</span>
                          </div>
                          {version.specs.notes && (
                            <div className="text-[10px] text-[#aaa] mt-2 italic bg-[#1a1a1a] p-2 rounded border border-[#222]">
                              "{version.specs.notes}"
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(version.specs)}
                          className="px-4 py-2 bg-white text-black text-[10px] uppercase font-bold rounded shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:bg-[#e0e0e0] transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfigSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#666]">{title}</h3>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

