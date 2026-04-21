import { LAYOUT_CONFIGS, PREVIEW_W, getBgStyle } from '../constants'

/**
 * CSS-based album page preview.
 * All theme photo values (frame, radius, gap) are defined at PREVIEW_W px width
 * and scaled to the actual `width` prop here.
 */
export default function AlbumPage({ photos = [], layoutId, theme, pageSize, orientation, margin, width }) {
  const effectiveW = orientation === 'landscape' ? pageSize.height : pageSize.width
  const effectiveH = orientation === 'landscape' ? pageSize.width  : pageSize.height
  const height     = Math.round(width * (effectiveH / effectiveW))

  const scale    = width / PREVIEW_W
  const marginPx = Math.round((margin / effectiveW) * width)
  const gapPx    = Math.max(1, Math.round(theme.photo.gap   * scale))
  const framePx  = Math.round(theme.photo.frame  * scale)
  const radiusPx = Math.round(theme.photo.radius * scale)

  const cfg = LAYOUT_CONFIGS[layoutId] || LAYOUT_CONFIGS['solo']

  return (
    <div
      style={{
        width,
        height,
        ...getBgStyle(theme.bg),
        padding: marginPx,
        boxSizing: 'border-box',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cfg.gridTemplateColumns,
          gridTemplateRows:    cfg.gridTemplateRows,
          gap:   gapPx,
          width: '100%',
          height: '100%',
        }}
      >
        {cfg.cells.map((cell, i) => (
          <PhotoCell
            key={i}
            photo={photos[i]}
            gridColumn={cell.gridColumn}
            gridRow={cell.gridRow}
            framePx={framePx}
            radiusPx={radiusPx}
            frameColor={theme.photo.frameColor}
            shadow={theme.photo.shadow}
            scale={scale}
          />
        ))}
      </div>
    </div>
  )
}

function PhotoCell({ photo, gridColumn, gridRow, framePx, radiusPx, frameColor, shadow, scale }) {
  const hasFrame   = framePx > 0
  const innerRadius = Math.max(0, radiusPx - framePx)

  return (
    <div
      style={{
        gridColumn,
        gridRow,
        overflow:        'hidden',
        position:        'relative',
        backgroundColor: hasFrame ? frameColor : 'transparent',
        borderRadius:    radiusPx,
        boxShadow:       shadow
          ? `0 ${Math.round(2 * scale)}px ${Math.round(10 * scale)}px rgba(0,0,0,0.28)`
          : 'none',
        padding: framePx,
        boxSizing: 'border-box',
      }}
    >
      {photo ? (
        <img
          src={photo.url}
          alt=""
          style={{
            width:       '100%',
            height:      '100%',
            objectFit:   'cover',
            display:     'block',
            borderRadius: innerRadius,
          }}
        />
      ) : (
        <div
          style={{
            width:           '100%',
            height:          '100%',
            backgroundColor: 'rgba(0,0,0,0.07)',
            borderRadius:    innerRadius,
          }}
        />
      )}
    </div>
  )
}
