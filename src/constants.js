export const MAX_PHOTOS = 100

// Base pixel width used to define all theme photo-style values
export const PREVIEW_W = 280

export const PAGE_SIZES = [
  { id: 'A4',     name: 'A4',           width: 210,   height: 297,   unit: 'mm' },
  { id: 'Letter', name: 'Letter',       width: 215.9, height: 279.4, unit: 'mm' },
  { id: 'Square', name: 'Square 20×20', width: 200,   height: 200,   unit: 'mm' },
  { id: '4x6',   name: '4×6 Photo',   width: 101.6, height: 152.4, unit: 'mm' },
  { id: '5x7',   name: '5×7 Photo',   width: 127,   height: 177.8, unit: 'mm' },
]

// CSS grid config for each layout (used in preview)
export const LAYOUT_CONFIGS = {
  'solo': {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    cells: [{ gridColumn: '1', gridRow: '1' }],
  },
  'duo-h': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    cells: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
    ],
  },
  'duo-v': {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 1fr',
    cells: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '1', gridRow: '2' },
    ],
  },
  'trio-top': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '3fr 2fr',
    cells: [
      { gridColumn: '1 / 3', gridRow: '1' },
      { gridColumn: '1',     gridRow: '2' },
      { gridColumn: '2',     gridRow: '2' },
    ],
  },
  'trio-bottom': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '2fr 3fr',
    cells: [
      { gridColumn: '1',     gridRow: '1' },
      { gridColumn: '2',     gridRow: '1' },
      { gridColumn: '1 / 3', gridRow: '2' },
    ],
  },
  'quartet': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    cells: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '1', gridRow: '2' },
      { gridColumn: '2', gridRow: '2' },
    ],
  },
  'sextet': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr 1fr',
    cells: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '1', gridRow: '2' },
      { gridColumn: '2', gridRow: '2' },
      { gridColumn: '1', gridRow: '3' },
      { gridColumn: '2', gridRow: '3' },
    ],
  },
  'nonet': {
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr 1fr',
    cells: Array.from({ length: 9 }, (_, i) => ({
      gridColumn: `${(i % 3) + 1}`,
      gridRow:    `${Math.floor(i / 3) + 1}`,
    })),
  },
}

export const LAYOUTS = [
  { id: 'solo',        name: '1 Photo',     perPage: 1 },
  { id: 'duo-h',       name: '2 Side by Side', perPage: 2 },
  { id: 'duo-v',       name: '2 Stacked',   perPage: 2 },
  { id: 'trio-top',    name: '3 (1+2)',      perPage: 3 },
  { id: 'trio-bottom', name: '3 (2+1)',      perPage: 3 },
  { id: 'quartet',     name: '4 (2×2)',      perPage: 4 },
  { id: 'sextet',      name: '6 (2×3)',      perPage: 6 },
  { id: 'nonet',       name: '9 (3×3)',      perPage: 9 },
]

/**
 * Themes — each defines a background style and photo treatment.
 * photo values (frame, radius, gap) are in pixels at PREVIEW_W scale.
 */
export const THEMES = [
  {
    id: 'minimal',
    name: 'Minimal',
    bg: { type: 'solid', color: '#ffffff' },
    photo: { frame: 0, frameColor: '#fff', radius: 0, shadow: false, gap: 4 },
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    bg: { type: 'solid', color: '#ede8dc' },
    photo: { frame: 10, frameColor: '#ffffff', radius: 2, shadow: true, gap: 6 },
  },
  {
    id: 'darkroom',
    name: 'Dark Room',
    bg: { type: 'solid', color: '#1c1c1e' },
    photo: { frame: 5, frameColor: '#2c2c2e', radius: 4, shadow: false, gap: 5 },
  },
  {
    id: 'linen',
    name: 'Linen',
    bg: { type: 'pattern', base: '#f9f6f1', patternType: 'linen', patternColor: '#e2d9cc' },
    photo: { frame: 10, frameColor: '#ffffff', radius: 2, shadow: true, gap: 6 },
  },
  {
    id: 'dots',
    name: 'Polka Dots',
    bg: { type: 'pattern', base: '#f0f4ff', patternType: 'dots', patternColor: '#c7d7f5' },
    photo: { frame: 6, frameColor: '#ffffff', radius: 4, shadow: true, gap: 5 },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: { type: 'gradient', stops: ['#f7971e', '#f953c6'], angle: 135 },
    photo: { frame: 0, frameColor: '#fff', radius: 8, shadow: true, gap: 5 },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: { type: 'gradient', stops: ['#2193b0', '#6dd5ed'], angle: 135 },
    photo: { frame: 5, frameColor: 'rgba(255,255,255,0.35)', radius: 6, shadow: false, gap: 5 },
  },
  {
    id: 'night',
    name: 'Night Sky',
    bg: { type: 'gradient', stops: ['#0f0c29', '#302b63', '#24243e'], angle: 160 },
    photo: { frame: 5, frameColor: 'rgba(255,255,255,0.12)', radius: 6, shadow: true, gap: 5 },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    bg: { type: 'gradient', stops: ['#ff758c', '#ff7eb3'], angle: 135 },
    photo: { frame: 8, frameColor: '#ffffff', radius: 12, shadow: true, gap: 6 },
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: { type: 'gradient', stops: ['#134e5e', '#71b280'], angle: 135 },
    photo: { frame: 0, frameColor: '#fff', radius: 4, shadow: true, gap: 4 },
  },
  {
    id: 'gold',
    name: 'Gold Rush',
    bg: { type: 'gradient', stops: ['#f7971e', '#ffd200'], angle: 135 },
    photo: { frame: 0, frameColor: '#fff', radius: 6, shadow: true, gap: 5 },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    bg: { type: 'gradient', stops: ['#d8b4fe', '#8b5cf6'], angle: 135 },
    photo: { frame: 6, frameColor: 'rgba(255,255,255,0.9)', radius: 8, shadow: true, gap: 5 },
  },
  {
    id: 'mint',
    name: 'Fresh Mint',
    bg: { type: 'gradient', stops: ['#a8edea', '#fed6e3'], angle: 135 },
    photo: { frame: 0, frameColor: '#fff', radius: 8, shadow: false, gap: 4 },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    bg: { type: 'gradient', stops: ['#43cea2', '#185a9d'], angle: 135 },
    photo: { frame: 5, frameColor: 'rgba(255,255,255,0.2)', radius: 10, shadow: false, gap: 5 },
  },
]

/** Returns a CSS style object for a background definition */
export function getBgStyle(bg) {
  switch (bg.type) {
    case 'solid':
      return { backgroundColor: bg.color }
    case 'gradient': {
      const stops = bg.stops.join(', ')
      return { background: `linear-gradient(${bg.angle}deg, ${stops})` }
    }
    case 'pattern': {
      if (bg.patternType === 'dots') {
        return {
          backgroundColor: bg.base,
          backgroundImage: `radial-gradient(circle, ${bg.patternColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '14px 14px',
        }
      }
      if (bg.patternType === 'linen') {
        return {
          backgroundColor: bg.base,
          backgroundImage: `repeating-linear-gradient(45deg, ${bg.patternColor} 0, ${bg.patternColor} 1px, transparent 0, transparent 50%)`,
          backgroundSize: '8px 8px',
        }
      }
      return { backgroundColor: bg.base || '#fff' }
    }
    default:
      return { backgroundColor: '#fff' }
  }
}

export const RESOLUTION_OPTIONS = [
  { id: 'draft',   label: 'Draft',   dpi: 150, description: 'Smaller file, faster export' },
  { id: 'quality', label: 'Quality', dpi: 300, description: 'Best for printing (recommended)' },
]

export const DEFAULT_CONFIG = {
  pageSize:    PAGE_SIZES[0],
  orientation: 'portrait',
  layout:      'quartet',
  theme:       THEMES[1], // Polaroid
  resolution:  RESOLUTION_OPTIONS[1],
  margin:      10,
}
