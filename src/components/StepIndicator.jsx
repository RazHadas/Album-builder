const STEPS = ['Upload', 'Layout', 'Export']

export default function StepIndicator({ step }) {
  return (
    <div className="max-w-lg mx-auto px-4 pb-3 flex items-center gap-1">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
              i < step  ? 'bg-white text-indigo-600' :
              i === step ? 'bg-white text-indigo-600 ring-2 ring-indigo-300' :
                           'bg-indigo-500 text-indigo-200'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-0.5 ${i <= step ? 'text-white' : 'text-indigo-300'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 rounded transition-colors ${i < step ? 'bg-white' : 'bg-indigo-500'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
