import { useRef, useState } from 'react'
import { PAGE_SIZES, LAYOUTS, LAYOUT_CONFIGS, THEMES, RESOLUTION_OPTIONS, PREVIEW_W, getBgStyle, parseTemplate } from '../constants'

export default function ConfigStep({ config, setConfig, pageCount, isAnalyzing, analyzeProgress, onBack, onNext }) {
  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))
  const fileRef = useRef(null)
  const [templateError, setTemplateError] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  const handleTemplateFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = parseTemplate(ev.target.result)
      if (result.ok) {
        set('customTemplate', result.template)
        setTemplateError(null)
      } else {
        setTemplateError(result.error)
      }
    }
    reader.readAsText(file)
  }

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

      {/* Custom Template */}
      <Card title="📐 Custom Layout Template">
        <p className="text-xs text-gray-500 leading-relaxed">
          Upload a JSON template designed with Claude AI. Each template defines exact photo zones on the page.
        </p>

        {config.customTemplate ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <span className="text-green-500 text-lg mt-0.5">✓</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800 truncate">{config.customTemplate.name}</p>
                {config.customTemplate.description && (
                  <p className="text-xs text-green-600 mt-0.5">{config.customTemplate.description}</p>
                )}
                <p className="text-xs text-green-600 mt-0.5">{config.customTemplate.cells.length} photo zone{config.customTemplate.cells.length !== 1 ? 's' : ''} per page</p>
              </div>
            </div>

            {/* Mini layout preview */}
            <TemplateMiniPreview template={config.customTemplate} />

            <button
              onClick={() => set('customTemplate', null)}
              className="w-full py-2 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Remove template
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {templateError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{templateError}</p>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              ⬆ Upload template JSON
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleTemplateFile} />
          </div>
        )}

        {/* Claude prompt helper */}
        <button
          onClick={() => setShowPrompt(p => !p)}
          className="w-full text-left text-xs text-indigo-500 font-medium hover:text-indigo-700 flex items-center gap-1"
        >
          <span>{showPrompt ? '▲' : '▼'}</span>
          How to generate a template with Claude
        </button>
        {showPrompt && <ClaudePromptHelper />}
      </Card>

      {/* Layout — dimmed when custom template active */}
      <Card title="Photos per Page">
        {config.customTemplate && (
          <p className="text-xs text-gray-400 -mt-1 mb-2">Overridden by custom template ({config.customTemplate.cells.length} zones)</p>
        )}
        <div className={`transition-opacity ${config.customTemplate ? 'opacity-40 pointer-events-none' : ''}`}>
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

/* ── Template mini preview ── */

function TemplateMiniPreview({ template }) {
  const W = 120, H = Math.round(W * 1.414)
  const margin = 6
  const aw = W - 2 * margin, ah = H - 2 * margin
  return (
    <div style={{ width: W, height: H, backgroundColor: '#f3f4f6', borderRadius: 8, position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
      {template.cells.map((cell, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left:   margin + cell.x * aw,
            top:    margin + cell.y * ah,
            width:  cell.w * aw,
            height: cell.h * ah,
            backgroundColor: `hsl(${(i * 47) % 360} 55% 70%)`,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            {cell.label || i + 1}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Claude prompt helper ── */

const CLAUDE_PROMPT = `Generate an Album Builder layout template JSON for me.

Format:
{
  "name": "Layout name",
  "description": "Short description",
  "cells": [
    { "x": 0.0, "y": 0.0, "w": 1.0, "h": 0.55, "label": "Main photo" },
    { "x": 0.0, "y": 0.57, "w": 0.48, "h": 0.43, "label": "Photo 2" },
    { "x": 0.52, "y": 0.57, "w": 0.48, "h": 0.43, "label": "Photo 3" }
  ]
}

Rules:
- x, y, w, h are fractions from 0.0 to 1.0 of the page content area
- x=0, y=0 is top-left corner
- x + w must be ≤ 1.0, y + h must be ≤ 1.0
- Leave ~0.02 gap between cells so photos don't touch
- "label" is optional but helpful

I want: [DESCRIBE YOUR LAYOUT HERE — e.g. "1 large panoramic photo on top, 3 equal photos in a row below" or "asymmetric: 1 tall photo on the left, 2 stacked on the right"]`

function ClaudePromptHelper() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(CLAUDE_PROMPT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
      <p className="text-xs text-gray-600 leading-relaxed">
        Open <strong>claude.ai</strong>, paste this prompt, describe your layout at the bottom, and save the JSON it returns as a <code className="bg-gray-200 px-1 rounded text-[10px]">.json</code> file.
      </p>
      <pre className="text-[9px] text-gray-500 bg-white border border-gray-200 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32">
        {CLAUDE_PROMPT}
      </pre>
      <button
        onClick={copy}
        className="w-full py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        {copied ? '✓ Copied!' : 'Copy prompt to clipboard'}
      </button>
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
