import { jsPDF } from 'jspdf'
import { renderPageToCanvas } from './canvasRender'

/**
 * Exports all album pages to a downloadable PDF.
 * Each page object: { photos: Photo[], theme: Theme }
 * @param {object[]} pages      - array of page objects
 * @param {object}   config     - album config
 * @param {Function} onProgress - called with (current, total)
 */
export async function exportToPdf(pages, config, onProgress) {
  const dpi = config.resolution.dpi

  const isLandscape = config.orientation === 'landscape'
  const pageWmm = isLandscape ? config.pageSize.height : config.pageSize.width
  const pageHmm = isLandscape ? config.pageSize.width  : config.pageSize.height

  const mmToPx  = dpi / 25.4
  const pageWpx = Math.round(pageWmm * mmToPx)
  const pageHpx = Math.round(pageHmm * mmToPx)

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit:   'mm',
    format: [pageWmm, pageHmm],
    compress: true,
  })

  for (let i = 0; i < pages.length; i++) {
    if (onProgress) onProgress(i, pages.length)

    if (i > 0) pdf.addPage([pageWmm, pageHmm], isLandscape ? 'landscape' : 'portrait')

    const page = pages[i]

    // Build a per-page config using the page's own theme
    const pageConfig = {
      ...config,
      theme: page.theme,
      pageSize: { ...config.pageSize, width: pageWmm, height: pageHmm },
    }

    const canvas  = await renderPageToCanvas(page.photos, pageConfig, pageWpx, pageHpx)
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWmm, pageHmm, undefined, 'FAST')

    // Yield to browser between pages
    await new Promise(r => setTimeout(r, 0))
  }

  if (onProgress) onProgress(pages.length, pages.length)

  const filename = `album-${new Date().toISOString().slice(0, 10)}.pdf`
  pdf.save(filename)
}
