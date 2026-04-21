import { useState } from 'react'
import AlbumPage from './AlbumPage'

export default function PreviewStep({ pages, config, onBack }) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress]       = useState(0)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState(null)

  const totalPhotos = pages.reduce((s, p) => s + p.photos.length, 0)
  const THUMB_W = 140

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
      setError('Export failed. Try Draft quality or fewer photos.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex flex-wrap gap-4">
        <Stat label="Pages"  value={pages.length} />
        <Stat label="Photos" value={totalPhotos} />
        <Stat label="Layout" value={config.layout} />
        <Stat label="Quality" value={`${config.resolution.dpi} DPI`} />
        {config.autoArrange && (
          <Stat label="Mode" value="✨ Smart" />
        )}
      </div>

      {/* Page thumbnails */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Page Preview</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {pages.map((page, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="page-thumb rounded-md overflow-hidden">
                <AlbumPage
                  photos={page.photos}
                  layoutId={config.layout}
                  theme={page.theme}
                  pageSize={config.pageSize}
                  orientation={config.orientation}
                  margin={config.margin}
                  width={THUMB_W}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{i + 1}</span>
              {config.autoArrange && (
                <span className="text-[9px] text-indigo-500 font-medium leading-tight text-center max-w-[56px] truncate">
                  {page.theme.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Export to PDF</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">{error}</div>
        )}
        {done && !isExporting && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-3 py-2">
            ✅ PDF downloaded! Check your downloads folder.
          </div>
        )}
        {isExporting && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Rendering pages…</span><span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">
          {pages.length} page{pages.length !== 1 ? 's' : ''} · {config.resolution.dpi} DPI · {config.pageSize.name} {config.orientation}
          {config.autoArrange ? ' · Smart Arrange' : ''}
        </p>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? `Generating… ${progress}%` : '⬇ Download PDF'}
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
