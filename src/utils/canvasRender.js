import { PREVIEW_W } from '../constants'

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = url
  })
}

function drawCover(ctx, img, x, y, w, h) {
  const imgAspect  = img.naturalWidth / img.naturalHeight
  const cellAspect = w / h
  let sx, sy, sw, sh
  if (imgAspect > cellAspect) {
    sh = img.naturalHeight
    sw = sh * cellAspect
    sx = (img.naturalWidth - sw) / 2
    sy = 0
  } else {
    sw = img.naturalWidth
    sh = sw / cellAspect
    sx = 0
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function roundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  if (r <= 0) { ctx.rect(x, y, w, h); return }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h,     x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y,         x + r, y)
  ctx.closePath()
}

// ── Background ──────────────────────────────────────────────────────────────

function drawBackground(ctx, bg, w, h) {
  switch (bg.type) {
    case 'solid':
      ctx.fillStyle = bg.color
      ctx.fillRect(0, 0, w, h)
      break

    case 'gradient': {
      const rad = (bg.angle * Math.PI) / 180
      const cx = w / 2, cy = h / 2
      const r  = Math.hypot(w, h) / 2
      const x1 = cx - Math.cos(rad) * r
      const y1 = cy - Math.sin(rad) * r
      const x2 = cx + Math.cos(rad) * r
      const y2 = cy + Math.sin(rad) * r
      const grad = ctx.createLinearGradient(x1, y1, x2, y2)
      bg.stops.forEach((color, i) => {
        grad.addColorStop(i / (bg.stops.length - 1), color)
      })
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      break
    }

    case 'pattern': {
      ctx.fillStyle = bg.base
      ctx.fillRect(0, 0, w, h)
      if (bg.patternType === 'dots')  drawDots(ctx, w, h, bg.patternColor)
      if (bg.patternType === 'linen') drawLinen(ctx, w, h, bg.patternColor)
      break
    }

    default:
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
  }
}

function drawDots(ctx, w, h, color) {
  const spacing = w / 20
  const radius  = spacing * 0.11
  ctx.fillStyle = color
  for (let x = spacing / 2; x < w; x += spacing) {
    for (let y = spacing / 2; y < h; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawLinen(ctx, w, h, color) {
  const spacing = w / 35
  ctx.save()
  ctx.globalAlpha = 0.45
  ctx.strokeStyle = color
  ctx.lineWidth   = Math.max(1, spacing * 0.12)
  for (let i = -h; i < w + h; i += spacing) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + h, h)
    ctx.stroke()
  }
  ctx.restore()
}

// ── Photo cell ───────────────────────────────────────────────────────────────

function drawPhotoCell(ctx, img, cell, photoStyle, themeScale) {
  const { x, y, w, h } = cell
  const framePx  = photoStyle.frame  * themeScale
  const radiusPx = photoStyle.radius * themeScale

  if (framePx > 0 || (photoStyle.shadow && radiusPx > 0)) {
    // Draw frame / shadow
    if (photoStyle.shadow) {
      ctx.save()
      ctx.shadowColor   = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur    = 10 * themeScale
      ctx.shadowOffsetY = 3  * themeScale
      ctx.fillStyle = parseFrameColor(photoStyle.frameColor)
      ctx.beginPath()
      roundedRect(ctx, x, y, w, h, radiusPx)
      ctx.fill()
      ctx.restore()
    } else if (framePx > 0) {
      ctx.fillStyle = parseFrameColor(photoStyle.frameColor)
      ctx.beginPath()
      roundedRect(ctx, x, y, w, h, radiusPx)
      ctx.fill()
    }
  }

  // Draw photo clipped to inner area
  const px = x + framePx
  const py = y + framePx
  const pw = w - 2 * framePx
  const ph = h - 2 * framePx
  if (pw <= 0 || ph <= 0) return

  const innerRadius = Math.max(0, radiusPx - framePx)

  ctx.save()
  ctx.beginPath()
  roundedRect(ctx, px, py, pw, ph, innerRadius)
  ctx.clip()
  if (img) {
    drawCover(ctx, img, px, py, pw, ph)
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.07)'
    ctx.fillRect(px, py, pw, ph)
  }
  ctx.restore()
}

// rgba strings in frameColor are safe to pass to canvas directly
function parseFrameColor(color) {
  return color || '#ffffff'
}

// ── Layout cells (same logic as CSS grid, but pixel coords) ─────────────────

function getCells(layoutId, aw, ah, x0, y0, gap) {
  switch (layoutId) {
    case 'solo':
      return [{ x: x0, y: y0, w: aw, h: ah }]

    case 'duo-h': {
      const cw = (aw - gap) / 2
      return [
        { x: x0,           y: y0, w: cw, h: ah },
        { x: x0 + cw + gap, y: y0, w: cw, h: ah },
      ]
    }

    case 'duo-v': {
      const ch = (ah - gap) / 2
      return [
        { x: x0, y: y0,           w: aw, h: ch },
        { x: x0, y: y0 + ch + gap, w: aw, h: ch },
      ]
    }

    case 'trio-top': {
      const h1 = ah * 0.6
      const h2 = ah - h1 - gap
      const cw = (aw - gap) / 2
      return [
        { x: x0,            y: y0,            w: aw, h: h1 },
        { x: x0,            y: y0 + h1 + gap,  w: cw, h: h2 },
        { x: x0 + cw + gap, y: y0 + h1 + gap,  w: cw, h: h2 },
      ]
    }

    case 'trio-bottom': {
      const h1 = ah * 0.4
      const h2 = ah - h1 - gap
      const cw = (aw - gap) / 2
      return [
        { x: x0,            y: y0,            w: cw, h: h1 },
        { x: x0 + cw + gap, y: y0,            w: cw, h: h1 },
        { x: x0,            y: y0 + h1 + gap,  w: aw, h: h2 },
      ]
    }

    case 'quartet': {
      const cw = (aw - gap) / 2
      const ch = (ah - gap) / 2
      return [
        { x: x0,            y: y0,            w: cw, h: ch },
        { x: x0 + cw + gap, y: y0,            w: cw, h: ch },
        { x: x0,            y: y0 + ch + gap,  w: cw, h: ch },
        { x: x0 + cw + gap, y: y0 + ch + gap,  w: cw, h: ch },
      ]
    }

    case 'sextet': {
      const cw = (aw - gap) / 2
      const ch = (ah - 2 * gap) / 3
      const cells = []
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 2; c++)
          cells.push({ x: x0 + c * (cw + gap), y: y0 + r * (ch + gap), w: cw, h: ch })
      return cells
    }

    case 'nonet': {
      const cw = (aw - 2 * gap) / 3
      const ch = (ah - 2 * gap) / 3
      const cells = []
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
          cells.push({ x: x0 + c * (cw + gap), y: y0 + r * (ch + gap), w: cw, h: ch })
      return cells
    }

    default:
      return [{ x: x0, y: y0, w: aw, h: ah }]
  }
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Renders one album page to an offscreen canvas and returns it.
 */
export async function renderPageToCanvas(pagePhotos, config, pageWidthPx, pageHeightPx) {
  const canvas  = document.createElement('canvas')
  canvas.width  = pageWidthPx
  canvas.height = pageHeightPx
  const ctx     = canvas.getContext('2d')

  const { theme, orientation, pageSize, margin } = config
  const effectiveWmm = orientation === 'landscape' ? pageSize.height : pageSize.width

  drawBackground(ctx, theme.bg, pageWidthPx, pageHeightPx)

  const mmToPx    = pageWidthPx / effectiveWmm
  const marginPx  = margin * mmToPx
  const themeScale = pageWidthPx / PREVIEW_W   // scale theme px values to canvas
  const gapPx     = theme.photo.gap * themeScale

  const aw = pageWidthPx  - 2 * marginPx
  const ah = pageHeightPx - 2 * marginPx

  const cells = getCells(config.layout, aw, ah, marginPx, marginPx, gapPx)

  const loadResults = await Promise.allSettled(
    pagePhotos.map(p => loadImage(p.url))
  )

  loadResults.forEach((result, i) => {
    const cell = cells[i]
    if (!cell) return
    const img = result.status === 'fulfilled' ? result.value : null
    drawPhotoCell(ctx, img, cell, theme.photo, themeScale)
  })

  return canvas
}
