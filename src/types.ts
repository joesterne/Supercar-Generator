export interface CarSpecs {
  engine: string;
  bodyKit: string;
  color: string;
  style: string;
  environment: string;
  ambientIntensity?: number;
}

export const ENGINES = ['V8 Twin-Turbo', 'V10 Naturally Aspirated', 'V12 Hyper-hybrid', 'Quad-Motor Electric'];
export const BODY_KITS = ['Aggressive Aero', 'Sleek Touring', 'Widebody Track', 'Minimalist Concept'];
export const COLORS = ['Midnight Black', 'Rosso Corsa', 'Nardo Gray', 'Electric Blue', 'Pearl White', 'Lime Green'];
export const STYLES = ['Cyberpunk', 'Classic Retro-Modern', 'Hyper-Futuristic', 'Luxury Grand Tourer'];
export const ENVIRONMENTS = ['Neon City Streets', 'Salt Flats at Sunset', 'Alpine Mountain Pass', 'Minimalist Studio', 'Rainy Tokyo Night'];
