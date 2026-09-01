export interface CarSpecs {
  engine: string;
  bodyKit: string;
  color: string;
  style: string;
  environment: string;
  ambientIntensity?: number;
  notes?: string;
}

export const ENGINES = ['V8 Twin-Turbo', 'V10 Naturally Aspirated', 'V12 Hyper-hybrid', 'Quad-Motor Electric', 'Boxer-6 Turbo', 'Hydrogen Fuel Cell'];
export const BODY_KITS = ['Aggressive Aero', 'Sleek Touring', 'Widebody Track', 'Minimalist Concept', 'Vintage Rally', 'Cyber-Street'];
export const COLORS = ['Midnight Black', 'Rosso Corsa', 'Nardo Gray', 'Electric Blue', 'Pearl White', 'Lime Green', 'Candy Apple Red', 'Satin Gold', 'Matte Gunmetal', 'Deep Ocean Teal'];
export const STYLES = ['Cyberpunk', 'Classic Retro-Modern', 'Hyper-Futuristic', 'Luxury Grand Tourer', 'JDM Tuner', 'Synthwave'];
export const ENVIRONMENTS = ['Neon City Streets', 'Salt Flats at Sunset', 'Alpine Mountain Pass', 'Minimalist Studio', 'Rainy Tokyo Night', 'Warehouse District', 'Forest Road'];
