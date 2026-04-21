import { LAYOUT_CONFIGS, PREVIEW_W, getBgStyle } from '../constants'

/**
 * Renders an album page preview.
 * Supports both built-in CSS-grid layouts and custom JSON templates
 * (absolute-positioned cells defined as fractions of the content area).
 */
export default function AlbumPage({ photos = [], layoutId, theme, pageSize, orientation, margin, width, customTemplate }) {
  const effectiveW = orientation === 'landscape' ? pageSize.height : pageSize.width
  const effectiveH = orientation === 'landscape' ? pageSize.width  : pageSize.height
  const height     = Math.round(width * (effectiveH / effectiveW))

  const scale    = width / PREVIEW_W
  const marginPx = Math.round((margin / effectiveW) * width)
  const framePx  = Math.round(theme.photo.frame  * scale)
  const radiusPx = Math.round(theme.photo.radius * scale)
  const gapPx    = Math.max(1, Math.round(theme.photo.gap * scale))

  const bgStyle = getBgStyle(theme.bg)
  const aw = width  - 2 * marginPx
  const ah = height - 2 * marginPx

  return (
    <div style={{ width, height, ...bgStyle, boxSizing: 'border-box', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: marginPx, top: marginPx, width: aw, height: ah }}>
        {customTemplate
          ? customTemplate.cells.map((cell, i) => (
              <PhotoCell
                key={i}
                photo={photos[i]}
                style={{
                  position: 'absolute',
                  left:   `${cell.x * 100}%`,
                  top:    `${cell.y * 100}%`,
                  width:  `${cell.w * 100}%`,
                  height: `${cell.h * 100}%`,
                }}
                framePx={framePx}
                radiusPx={radiusPx}
                frameColor={theme.photo.frameColor}
                shadow={theme.photo.shadow}
                scale={scale}
                label={cell.label}
              />
            ))
          : <GridLayout
              cfg={LAYOUT_CONFIGS[layoutId] || LAYOUT_CONFIGS['solo']}
              photos={photos}
              gapPx={gapPx}
              framePx={framePx}
              radiusPx={radiusPx}
              frameColor={theme.photo.frameColor}
              shadow={theme.photo.shadow}
              scale={scale}
            />
        }
      </div>
    </div>
  )
}

function GridLayout({ cfg, photos, gapPx, framePx, radiusPx, frameColor, shadow, scale }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cfg.gridTemplateColumns,
      gridTemplateRows:    cfg.gridTemplateRows,
      gap:    gapPx,
      width:  '100%',
      height: '100%',
    }}>
      {cfg.cells.map((cell, i) => (
        <PhotoCell
          key={i}
          photo={photos[i]}
          style={{ gridColumn: cell.gridColumn, gridRow: cell.gridRow }}
          framePx={framePx}
          radiusPx={radiusPx}
          frameColor={frameColor}
          shadow={shadow}
          scale={scale}
        />
      ))}
    </div>
  )
}

function PhotoCell({ photo, style, framePx, radiusPx, frameColor, shadow, scale, label }) {
  const hasFrame    = framePx > 0
  const innerRadius = Math.max(0, radiusPx - framePx)

  return (
    <div style={{
      ...style,
      overflow:        'hidden',
      backgroundColor: hasFrame ? frameColor : 'transparent',
      borderRadius:    radiusPx,
      boxShadow:       shadow ? `0 ${Math.round(2 * scale)}px ${Math.round(10 * scale)}px rgba(0,0,0,0.28)` : 'none',
      padding:         framePx,
      boxSizing:       'border-box',
    }}>
      {photo ? (
        <img src={photo.url} alt={label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: innerRadius }} />
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: innerRadius, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {label && <span style={{ fontSize: Math.max(8, 10 * scale), color: 'rgba(0,0,0,0.25)', textAlign: 'center', padding: 4 }}>{label}</span>}
        </div>
      )}
    </div>
  )
}
