import { LAYOUT_CONFIGS } from '../constants'

/**
 * CSS-based album page preview.
 * Renders at `width` pixels with correct aspect ratio.
 */
export default function AlbumPage({ photos = [], layoutId, background, pageSize, orientation, margin, width }) {
  const effectiveW = orientation === 'landscape' ? pageSize.height : pageSize.width
  const effectiveH = orientation === 'landscape' ? pageSize.width  : pageSize.height
  const aspectRatio = effectiveH / effectiveW
  const height = Math.round(width * aspectRatio)

  const marginPx = Math.round((margin / effectiveW) * width)
  const gapPx    = Math.max(1, Math.round((4 / effectiveW) * width))

  const cfg = LAYOUT_CONFIGS[layoutId] || LAYOUT_CONFIGS['solo']

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: background.value,
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
          gridTemplateRows: cfg.gridTemplateRows,
          gap: gapPx,
          width: '100%',
          height: '100%',
        }}
      >
        {cfg.cells.map((cell, i) => (
          <div
            key={i}
            style={{
              gridColumn: cell.gridColumn,
              gridRow: cell.gridRow,
              overflow: 'hidden',
              backgroundColor: 'rgba(0,0,0,0.06)',
            }}
          >
            {photos[i] ? (
              <img
                src={photos[i].url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
