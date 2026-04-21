import { PAGE_SIZES, LAYOUTS, LAYOUT_CONFIGS, BACKGROUND_PRESETS, RESOLUTION_OPTIONS } from '../constants'

export default function ConfigStep({ config, setConfig, pageCount, onBack, onNext }) {
  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-4">
      {pageCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm text-indigo-700 font-medium">
          This will generate <strong>{pageCount} page{pageCount !== 1 ? 's' : ''}</strong> with your current settings
        </div>
      )}

      {/* Page Size */}
      <Card title="Page Size">
        <div className="grid grid-cols-2 gap-2">
          {PAGE_SIZES.map(size => (
            <button
              key={size.id}
              onClick={() => set('pageSize', size)}
              className={optionClass(config.pageSize.id === size.id)}
            >
              <span className="font-semibold text-sm">{size.name}</span>
              <span className="text-xs text-gray-500 mt-0.5">
                {Math.round(size.width)} × {Math.round(size.height)} mm
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Orientation */}
      <Card title="Orientation">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'portrait',  label: 'Portrait',  icon: '▯' },
            { id: 'landscape', label: 'Landscape', icon: '▭' },
          ].map(o => (
            <button
              key={o.id}
              onClick={() => set('orientation', o.id)}
              className={optionClass(config.orientation === o.id)}
            >
              <span className="text-2xl leading-none">{o.icon}</span>
              <span className="text-sm font-medium mt-1">{o.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Layout */}
      <Card title="Photos per Page">
        <div className="grid grid-cols-4 gap-2">
          {LAYOUTS.map(layout => (
            <button
              key={layout.id}
              onClick={() => set('layout', layout.id)}
              className={[
                'flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all',
                config.layout === layout.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              ].join(' ')}
            >
              <LayoutIcon id={layout.id} selected={config.layout === layout.id} />
              <span className="text-[10px] text-gray-500 leading-tight text-center">{layout.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Background */}
      <Card title="Background Color">
        <div className="flex flex-wrap gap-2 items-center">
          {BACKGROUND_PRESETS.map(bg => (
            <button
              key={bg.id}
              onClick={() => set('background', bg)}
              title={bg.name}
              className={[
                'w-9 h-9 rounded-full border-4 transition-all shrink-0',
                bg.value === '#ffffff' ? 'border-gray-200' : 'border-transparent',
                config.background.id === bg.id ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105',
              ].join(' ')}
              style={{ backgroundColor: bg.value }}
            />
          ))}
          {/* Custom color picker */}
          <label
            className="relative w-9 h-9 rounded-full border-4 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-indigo-400 hover:scale-105 transition-all shrink-0"
            title="Custom color"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-yellow-300 via-green-400 to-blue-500" />
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={config.background.value}
              onChange={e => set('background', { id: 'custom', name: 'Custom', value: e.target.value })}
            />
          </label>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: config.background.value }} />
          <span className="text-xs text-gray-500">{config.background.name} · {config.background.value}</span>
        </div>
      </Card>

      {/* Print Quality */}
      <Card title="Print Quality">
        <div className="grid grid-cols-2 gap-2">
          {RESOLUTION_OPTIONS.map(res => (
            <button
              key={res.id}
              onClick={() => set('resolution', res)}
              className={optionClass(config.resolution.id === res.id)}
            >
              <span className="font-semibold text-sm">{res.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">{res.dpi} DPI</span>
              <span className="text-[10px] text-gray-400">{res.description}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Margin */}
      <Card title={`Page Margin — ${config.margin} mm`}>
        <input
          type="range"
          min="0"
          max="25"
          step="1"
          value={config.margin}
          onChange={e => set('margin', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0 mm</span>
          <span>25 mm</span>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600 hover:border-gray-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          Preview Album →
        </button>
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function optionClass(selected) {
  return [
    'flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all w-full',
    selected
      ? 'border-indigo-500 bg-indigo-50'
      : 'border-gray-200 bg-white hover:border-gray-300',
  ].join(' ')
}

function LayoutIcon({ id, selected }) {
  const color = selected ? '#6366f1' : '#9ca3af'
  const bg = selected ? '#e0e7ff' : '#f3f4f6'
  const s = { backgroundColor: color, borderRadius: 2 }

  const wrap = {
    width: 40,
    height: 40,
    backgroundColor: bg,
    borderRadius: 6,
    padding: 4,
    display: 'grid',
    gap: 2,
    boxSizing: 'border-box',
  }

  const cfg = LAYOUT_CONFIGS[id]
  if (!cfg) return <div style={{ ...wrap, gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}><div style={s} /></div>

  return (
    <div style={{ ...wrap, gridTemplateColumns: cfg.gridTemplateColumns, gridTemplateRows: cfg.gridTemplateRows }}>
      {cfg.cells.map((cell, i) => (
        <div key={i} style={{ ...s, gridColumn: cell.gridColumn, gridRow: cell.gridRow }} />
      ))}
    </div>
  )
}
