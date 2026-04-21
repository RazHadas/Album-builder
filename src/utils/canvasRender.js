function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
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

function getCells(layoutId, aw, ah, x0, y0, gap) {
  switch (layoutId) {
    case 'solo':
      return [{ x: x0, y: y0, w: aw, h: ah }]

    case 'duo-h': {
      const cw = (aw - gap) / 2
      return [
        { x: x0,          y: y0, w: cw, h: ah },
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
        { x: x0,           y: y0,          w: aw, h: h1 },
        { x: x0,           y: y0 + h1 + gap, w: cw, h: h2 },
        { x: x0 + cw + gap, y: y0 + h1 + gap, w: cw, h: h2 },
      ]
    }

    case 'trio-bottom': {
      const h1 = ah * 0.4
      const h2 = ah - h1 - gap
      const cw = (aw - gap) / 2
      return [
        { x: x0,           y: y0,          w: cw, h: h1 },
        { x: x0 + cw + gap, y: y0,          w: cw, h: h1 },
        { x: x0,           y: y0 + h1 + gap, w: aw, h: h2 },
      ]
    }

    case 'quartet': {
      const cw = (aw - gap) / 2
      const ch = (ah - gap) / 2
      return [
        { x: x0,           y: y0,           w: cw, h: ch },
        { x: x0 + cw + gap, y: y0,           w: cw, h: ch },
        { x: x0,           y: y0 + ch + gap, w: cw, h: ch },
        { x: x0 + cw + gap, y: y0 + ch + gap, w: cw, h: ch },
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

/**
 * Renders one album page to an offscreen canvas and returns it.
 * @param {Array}  pagePhotos  - array of photo objects with .url
 * @param {object} config      - { layout, background, pageSize, orientation, margin, resolution }
 * @param {number} pageWidthPx
 * @param {number} pageHeightPx
 */
export async function renderPageToCanvas(pagePhotos, config, pageWidthPx, pageHeightPx) {
  const canvas = document.createElement('canvas')
  canvas.width  = pageWidthPx
  canvas.height = pageHeightPx
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = config.background.value || '#ffffff'
  ctx.fillRect(0, 0, pageWidthPx, pageHeightPx)

  // Convert mm → px using effective page width in mm
  const effectiveWmm = config.orientation === 'landscape' ? config.pageSize.height : config.pageSize.width
  const mmToPx = pageWidthPx / effectiveWmm
  const marginPx = config.margin * mmToPx
  const gapPx    = 4 * mmToPx   // 4 mm gap between photos

  const aw = pageWidthPx  - 2 * marginPx
  const ah = pageHeightPx - 2 * marginPx

  const cells = getCells(config.layout, aw, ah, marginPx, marginPx, gapPx)

  // Load & draw photos
  const loadResults = await Promise.allSettled(
    pagePhotos.map(p => loadImage(p.url))
  )

  loadResults.forEach((result, i) => {
    const cell = cells[i]
    if (!cell) return

    if (result.status === 'fulfilled') {
      ctx.save()
      ctx.beginPath()
      ctx.rect(cell.x, cell.y, cell.w, cell.h)
      ctx.clip()
      drawCover(ctx, result.value, cell.x, cell.y, cell.w, cell.h)
      ctx.restore()
    } else {
      // Placeholder for failed images
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
      ctx.fillStyle = '#9ca3af'
      ctx.font = `${Math.min(cell.w, cell.h) * 0.25}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', cell.x + cell.w / 2, cell.y + cell.h / 2)
    }
  })

  return canvas
}
