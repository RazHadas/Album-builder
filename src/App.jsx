import { useState, useMemo } from 'react'
import { LAYOUTS, DEFAULT_CONFIG } from './constants'
import StepIndicator from './components/StepIndicator'
import UploadStep from './components/UploadStep'
import ConfigStep from './components/ConfigStep'
import PreviewStep from './components/PreviewStep'

export default function App() {
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState([])
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const perPage = useMemo(() => {
    const layout = LAYOUTS.find(l => l.id === config.layout)
    return layout ? layout.perPage : 4
  }, [config.layout])

  const pages = useMemo(() => {
    const result = []
    for (let i = 0; i < photos.length; i += perPage) {
      result.push(photos.slice(i, i + perPage))
    }
    return result
  }, [photos, perPage])

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
