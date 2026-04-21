import { THEMES } from '../constants'

// ── Color extraction ─────────────────────────────────────────────────────────

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    default: h = ((r - g) / d + 4) / 6
  }
  return [h * 360, s, l]
}

/** Circular mean for hue angles (handles 0°/360° wrap correctly) */
function circularMeanHue(hues) {
  if (!hues.length) return 0
  const sinSum = hues.reduce((s, h) => s + Math.sin(h * Math.PI / 180), 0)
  const cosSum = hues.reduce((s, h) => s + Math.cos(h * Math.PI / 180), 0)
  const mean = Math.atan2(sinSum / hues.length, cosSum / hues.length) * 180 / Math.PI
  return mean < 0 ? mean + 360 : mean
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

/**
 * Samples the dominant color of a photo via an offscreen canvas.
 * Returns { hue, sat, light } in HSL, plus raw { r, g, b } average.
 */
export function extractDominantColor(url) {
  return new Promise(resolve => {
    const img = new Image()
    const fallback = { hue: 0, sat: 0, light: 0.5, r: 128, g: 128, b: 128 }

    img.onload = () => {
      try {
        const SIZE = 60
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        // Draw center crop (skip outer 10% which may be white/black borders)
        const pad = 0.1
        const sw = img.naturalWidth  * (1 - 2 * pad)
        const sh = img.naturalHeight * (1 - 2 * pad)
        const sx = img.naturalWidth  * pad
        const sy = img.naturalHeight * pad
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE)

        const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

        // Collect HSL for each pixel, weight by saturation so vivid colours dominate
        let weightedHueSin = 0, weightedHueCos = 0
        let totalSat = 0, totalLight = 0, totalWeight = 0

        for (let i = 0; i < data.length; i += 4) {
          const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
          const weight = s + 0.1          // low-sat pixels still count a little
          weightedHueSin += Math.sin(h * Math.PI / 180) * weight
          weightedHueCos += Math.cos(h * Math.PI / 180) * weight
          totalSat   += s * weight
          totalLight += l * weight
          totalWeight += weight
        }

        const hueRad = Math.atan2(weightedHueSin / totalWeight, weightedHueCos / totalWeight)
        const hue   = ((hueRad * 180 / Math.PI) + 360) % 360
        const sat   = totalSat   / totalWeight
        const light = totalLight / totalWeight

        resolve({ hue, sat, light })
      } catch {
        resolve(fallback)
      }
    }
    img.onerror = () => resolve(fallback)
    img.src = url
  })
}

// ── Auto-theme matching ───────────────────────────────────────────────────────

const theme = id => THEMES.find(t => t.id === id) || THEMES[0]

/**
 * Given an array of photos with { hue, sat, light } dominantColor,
 * returns the Theme that best complements the page's overall mood.
 */
export function getAutoTheme(pageColors) {
  if (!pageColors.length) return theme('polaroid')

  const avgSat   = avg(pageColors.map(c => c.sat))
  const avgLight = avg(pageColors.map(c => c.light))
  const avgHue   = circularMeanHue(pageColors.map(c => c.hue))

  // Grayscale / very desaturated
  if (avgSat < 0.10) {
    return avgLight < 0.35 ? theme('darkroom') : theme('minimal')
  }

  // Warm neutral / sepia feel
  if (avgSat < 0.22 && avgHue > 20 && avgHue < 55) {
    return theme('linen')
  }

  // Map hue → theme
  if (avgHue < 12 || avgHue >= 348) return theme('rose')      // deep red / crimson
  if (avgHue <  38) return theme('sunset')                     // red-orange
  if (avgHue <  65) return theme('gold')                       // amber / yellow
  if (avgHue < 100) return theme('mint')                       // yellow-green
  if (avgHue < 158) return theme('forest')                     // green
  if (avgHue < 198) return theme('aurora')                     // teal / cyan
  if (avgHue < 230) return theme('ocean')                      // sky blue
  if (avgHue < 260) return theme('night')                      // deep blue / indigo
  if (avgHue < 290) return theme('lavender')                   // violet / purple
  if (avgHue < 325) return theme('rose')                       // pink / magenta
  return theme('sunset')                                        // red-pink wrap-around
}

// ── Full pipeline ─────────────────────────────────────────────────────────────

/**
 * Analyses all photos, sorts them by dominant hue, and groups into pages.
 * Each page object includes `{ photos, theme, colors }`.
 *
 * @param {object[]} photos     - array of photo objects with .url
 * @param {number}   perPage    - photos per page
 * @param {Function} onProgress - called with (done, total)
 * @returns {Promise<Array<{photos, theme, colors}>>}
 */
export async function buildAutoPages(photos, perPage, onProgress) {
  // 1. Extract dominant colour for every photo
  const analysed = await Promise.all(
    photos.map(async (photo, i) => {
      const color = await extractDominantColor(photo.url)
      if (onProgress) onProgress(i + 1, photos.length)
      return { ...photo, dominantColor: color }
    })
  )

  // 2. Sort: colour photos by hue, B&W photos by lightness at the end
  analysed.sort((a, b) => {
    const aGray = a.dominantColor.sat < 0.12
    const bGray = b.dominantColor.sat < 0.12
    if (aGray && bGray) return a.dominantColor.light - b.dominantColor.light
    if (aGray) return 1
    if (bGray) return -1
    return a.dominantColor.hue - b.dominantColor.hue
  })

  // 3. Group into pages and pick a matching theme per page
  const pages = []
  for (let i = 0; i < analysed.length; i += perPage) {
    const pagePhotos = analysed.slice(i, i + perPage)
    const pageColors = pagePhotos.map(p => p.dominantColor)
    const pageTheme  = getAutoTheme(pageColors)
    pages.push({ photos: pagePhotos, theme: pageTheme, colors: pageColors })
  }

  return pages
}
