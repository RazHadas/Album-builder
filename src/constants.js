export const MAX_PHOTOS = 100

export const PAGE_SIZES = [
  { id: 'A4',     name: 'A4',         width: 210,   height: 297,   unit: 'mm' },
  { id: 'Letter', name: 'Letter',     width: 215.9, height: 279.4, unit: 'mm' },
  { id: 'Square', name: 'Square 20×20', width: 200,  height: 200,  unit: 'mm' },
  { id: '4x6',   name: '4×6 Photo',  width: 101.6, height: 152.4, unit: 'mm' },
  { id: '5x7',   name: '5×7 Photo',  width: 127,   height: 177.8, unit: 'mm' },
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
      gridRow: `${Math.floor(i / 3) + 1}`,
    })),
  },
}

export const LAYOUTS = [
  { id: 'solo',         name: '1 Photo',      perPage: 1 },
  { id: 'duo-h',        name: '2 Side by Side', perPage: 2 },
  { id: 'duo-v',        name: '2 Stacked',    perPage: 2 },
  { id: 'trio-top',     name: '3 (1+2)',       perPage: 3 },
  { id: 'trio-bottom',  name: '3 (2+1)',       perPage: 3 },
  { id: 'quartet',      name: '4 (2×2)',       perPage: 4 },
  { id: 'sextet',       name: '6 (2×3)',       perPage: 6 },
  { id: 'nonet',        name: '9 (3×3)',       perPage: 9 },
]

export const BACKGROUND_PRESETS = [
  { id: 'white',    name: 'White',      value: '#ffffff' },
  { id: 'cream',    name: 'Cream',      value: '#fef9f0' },
  { id: 'lgray',    name: 'Light Gray', value: '#f3f4f6' },
  { id: 'dgray',    name: 'Dark Gray',  value: '#374151' },
  { id: 'black',    name: 'Black',      value: '#111827' },
  { id: 'navy',     name: 'Navy',       value: '#1e3a5f' },
  { id: 'forest',   name: 'Forest',     value: '#14532d' },
  { id: 'burgundy', name: 'Burgundy',   value: '#7f1d1d' },
  { id: 'blush',    name: 'Blush',      value: '#fce7f3' },
  { id: 'sky',      name: 'Sky Blue',   value: '#e0f2fe' },
]

export const RESOLUTION_OPTIONS = [
  { id: 'draft',   label: 'Draft',   dpi: 150, description: 'Smaller file, faster export' },
  { id: 'quality', label: 'Quality', dpi: 300, description: 'Best for printing (recommended)' },
]

export const DEFAULT_CONFIG = {
  pageSize:    PAGE_SIZES[0],
  orientation: 'portrait',
  layout:      'quartet',
  background:  BACKGROUND_PRESETS[0],
  resolution:  RESOLUTION_OPTIONS[1],
  margin:      10,
}
