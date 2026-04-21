import { PAGE_SIZES, LAYOUTS, LAYOUT_CONFIGS, THEMES, RESOLUTION_OPTIONS, PREVIEW_W, getBgStyle } from '../constants'

export default function ConfigStep({ config, setConfig, pageCount, isAnalyzing, analyzeProgress, onBack, onNext }) {
  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-4">
      {pageCount > 0 && !isAnalyzing && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm text-indigo-700 font-medium">
          {config.autoArrange
            ? <>✨ Smart arrange: <strong>{pageCount} page{pageCount !== 1 ? 's' : ''}</strong>, each with a matched theme</>
            : <><strong>{pageCount} page{pageCount !== 1 ? 's' : ''}</strong> with current settings</>
          }
        </div>
      )}
      {isAnalyzing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
          <p className="text-sm text-amber-700 font-medium">🔍 Analysing photo colours… {analyzeProgress}%</p>
          <div className="w-full bg-amber-200 rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${analyzeProgress}%` }} />
          </div>
        </div>
      )}

      {/* Smart Arrange */}
      <Card title="✨ Smart Arrange">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Auto-arrange by colour</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Scans each photo's dominant colour, groups similar photos together, and picks a matching theme automatically for each page.
            </p>
          </div>
          <button
            onClick={() => set('autoArrange', !config.autoArrange)}
            className={[
              'relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none',
              config.autoArrange ? 'bg-indigo-500' : 'bg-gray-300',
            ].join(' ')}
          >
            <span className={[
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              config.autoArrange ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')} />
          </button>
        </div>
        {config.autoArrange && !isAnalyzing && pageCount > 0 && (
          <div className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2 leading-relaxed">
            Photos sorted by hue — each page gets a theme that complements its colours. The manual theme selector below is ignored.
          </div>
        )}
      </Card>

      {/* Theme — dimmed when auto-arrange is on */}
      <Card title="🎨 Visual Theme">
        {config.autoArrange && (
          <p className="text-xs text-gray-400 -mt-1 mb-2">Overridden by Smart Arrange (shown for reference)</p>
        )}
        <div className={`grid grid-cols-4 gap-2 sm:grid-cols-5 transition-opacity ${config.autoArrange ? 'opacity-40 pointer-events-none' : ''}`}>
          {THEMES.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={config.theme.id === theme.id}
              onClick={() => set('theme', theme)}
            />
          ))}
        </div>
      </Card>

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
          min="0" max="25" step="1"
          value={config.margin}
          onChange={e => set('margin', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0 mm</span><span>25 mm</span>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600 hover:border-gray-300 transition-colors">
          ← Back
        </button>
        <button onClick={onNext} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors">
          Preview Album →
        </button>
      </div>
    </div>
  )
}

/* ── Theme card with live mini-page preview ── */

const MINI_W = 58
const MINI_H = Math.round(MINI_W * 1.414)

function ThemeCard({ theme, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center gap-1 rounded-xl overflow-hidden transition-all focus:outline-none',
        selected
          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md'
          : 'hover:scale-105 hover:shadow-sm',
      ].join(' ')}
    >
      <ThemeMiniPage theme={theme} />
      <span className={`text-[9px] font-medium leading-tight text-center px-0.5 ${selected ? 'text-indigo-600' : 'text-gray-500'}`}>
        {theme.name}
      </span>
    </button>
  )
}

function ThemeMiniPage({ theme }) {
  const margin = 4
  const scale  = MINI_W / PREVIEW_W
  const gap    = Math.max(1, Math.round(theme.photo.gap   * scale))
  const frame  = Math.round(theme.photo.frame  * scale)
  const radius = Math.round(theme.photo.radius * scale)

  const cellW = (MINI_W - 2 * margin - gap) / 2
  const cellH = (MINI_H - 2 * margin - gap) / 2

  const innerRadius = Math.max(0, radius - frame)

  return (
    <div
      style={{
        width:    MINI_W,
        height:   MINI_H,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        ...getBgStyle(theme.bg),
      }}
    >
      {[0, 1, 2, 3].map(i => {
        const col = i % 2
        const row = Math.floor(i / 2)
        return (
          <div
            key={i}
            style={{
              position:        'absolute',
              left:            margin + col * (cellW + gap),
              top:             margin + row * (cellH + gap),
              width:           cellW,
              height:          cellH,
              backgroundColor: frame > 0 ? theme.photo.frameColor : 'rgba(0,0,0,0)',
              borderRadius:    radius,
              boxShadow:       theme.photo.shadow ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
              padding:         frame,
              boxSizing:       'border-box',
            }}
          >
            <div
              style={{
                width:           '100%',
                height:          '100%',
                backgroundColor: 'rgba(120,120,120,0.45)',
                borderRadius:    innerRadius,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ── shared helpers ── */

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
    selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300',
  ].join(' ')
}

function LayoutIcon({ id, selected }) {
  const color = selected ? '#6366f1' : '#9ca3af'
  const bg    = selected ? '#e0e7ff' : '#f3f4f6'
  const s     = { backgroundColor: color, borderRadius: 2 }
  const wrap  = {
    width: 40, height: 40, backgroundColor: bg, borderRadius: 6,
    padding: 4, display: 'grid', gap: 2, boxSizing: 'border-box',
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
