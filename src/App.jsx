import { useState, useMemo, useEffect, useCallback } from 'react'
import { LAYOUTS, DEFAULT_CONFIG } from './constants'
import { buildAutoPages } from './utils/colorAnalysis'
import StepIndicator from './components/StepIndicator'
import UploadStep from './components/UploadStep'
import ConfigStep from './components/ConfigStep'
import PreviewStep from './components/PreviewStep'

export default function App() {
  const [step, setStep]   = useState(0)
  const [photos, setPhotos] = useState([])
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  // Auto-arrange state
  const [autoPages, setAutoPages]       = useState(null)   // Array<{photos,theme,colors}> | null
  const [isAnalyzing, setIsAnalyzing]   = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)

  const perPage = useMemo(() => {
    if (config.customTemplate) return config.customTemplate.cells.length
    const layout = LAYOUTS.find(l => l.id === config.layout)
    return layout ? layout.perPage : 4
  }, [config.layout, config.customTemplate])

  // Manual pages (single theme, original order)
  const manualPages = useMemo(() => {
    const result = []
    for (let i = 0; i < photos.length; i += perPage) {
      result.push({ photos: photos.slice(i, i + perPage), theme: config.theme })
    }
    return result
  }, [photos, perPage, config.theme])

  // Re-run auto-analysis whenever autoArrange is toggled on, or photos/perPage change
  const runAnalysis = useCallback(async () => {
    if (!config.autoArrange || photos.length === 0) {
      setAutoPages(null)
      return
    }
    setIsAnalyzing(true)
    setAnalyzeProgress(0)
    try {
      const pages = await buildAutoPages(photos, perPage, (done, total) => {
        setAnalyzeProgress(Math.round((done / total) * 100))
      })
      setAutoPages(pages)
    } finally {
      setIsAnalyzing(false)
    }
  }, [config.autoArrange, photos, perPage])

  useEffect(() => { runAnalysis() }, [runAnalysis])

  const pages = config.autoArrange && autoPages ? autoPages : manualPages

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <span className="text-lg font-bold tracking-tight">Album Builder</span>
          </div>
          {photos.length > 0 && (
            <span className="text-indigo-200 text-sm">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <StepIndicator step={step} />
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-10">
        {step === 0 && (
          <UploadStep
            photos={photos}
            setPhotos={setPhotos}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <ConfigStep
            config={config}
            setConfig={setConfig}
            pageCount={pages.length}
            isAnalyzing={isAnalyzing}
            analyzeProgress={analyzeProgress}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <PreviewStep
            pages={pages}
            config={config}
            onBack={() => setStep(1)}
          />
        )}
      </main>
    </div>
  )
}
