import { useState } from 'react'
import AlbumPage from './AlbumPage'

export default function PreviewStep({ pages, config, onBack }) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const totalPhotos = pages.reduce((s, p) => s + p.length, 0)

  const handleExport = async () => {
    setIsExporting(true)
    setDone(false)
    setError(null)
    setProgress(0)
    try {
      const { exportToPdf } = await import('../utils/exportPdf')
      await exportToPdf(pages, config, (current, total) => {
        setProgress(Math.round((current / total) * 100))
      })
      setDone(true)
    } catch (err) {
      console.error(err)
      setError('Export failed. Please try with Draft quality or fewer photos.')
    } finally {
      setIsExporting(false)
    }
  }

  const THUMB_W = 150

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex flex-wrap gap-4">
        <Stat label="Pages" value={pages.length} />
        <Stat label="Photos" value={totalPhotos} />
        <Stat label="Layout" value={config.layout} />
        <Stat label="Quality" value={`${config.resolution.dpi} DPI`} />
      </div>

      {/* Page grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
          Page Preview
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {pages.map((pagePhotos, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="page-thumb rounded-md overflow-hidden">
                <AlbumPage
                  photos={pagePhotos}
                  layoutId={config.layout}
                  background={config.background}
                  pageSize={config.pageSize}
                  orientation={config.orientation}
                  margin={config.margin}
                  width={THUMB_W}
                />
              </div>
              <span className="text-xs text-gray-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export panel */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Export to PDF</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {done && !isExporting && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-3 py-2">
            ✅ PDF downloaded! Check your downloads folder.
          </div>
        )}

        {isExporting && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Rendering pages…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-0.5">
          <p>· {pages.length} page{pages.length !== 1 ? 's' : ''} · {config.resolution.dpi} DPI · {config.pageSize.name} {config.orientation}</p>
          <p>· Large albums at 300 DPI may take a minute to render</p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <span>Generating… {progress}%</span>
          ) : (
            <>
              <span>⬇</span>
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      <button
        onClick={onBack}
        disabled={isExporting}
        className="w-full py-3.5 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-50"
      >
        ← Back to Settings
      </button>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-gray-800 capitalize">{value}</span>
    </div>
  )
}
