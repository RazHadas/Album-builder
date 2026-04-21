import { useState, useRef, useCallback } from 'react'
import { MAX_PHOTOS } from '../constants'

export default function UploadStep({ photos, setPhotos, onNext }) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dropTargetIdx, setDropTargetIdx] = useState(null)
  const fileInputRef = useRef(null)

  const addFiles = useCallback((files) => {
    const images = Array.from(files).filter(f => f.type.startsWith('image/'))
    const toAdd = images.slice(0, MAX_PHOTOS - photos.length)
    if (!toAdd.length) return
    const newPhotos = toAdd.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }, [photos.length, setPhotos])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removePhoto = (id) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) URL.revokeObjectURL(photo.url)
      return prev.filter(p => p.id !== id)
    })
  }

  const handleThumbDrop = (toIdx) => {
    if (draggedIdx === null || draggedIdx === toIdx) return
    setPhotos(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(draggedIdx, 1)
      arr.splice(toIdx, 0, moved)
      return arr
    })
    setDraggedIdx(null)
    setDropTargetIdx(null)
  }

  const full = photos.length >= MAX_PHOTOS

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !full && fileInputRef.current?.click()}
        className={[
          'rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all select-none',
          isDragging ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/40',
          full ? 'opacity-60 pointer-events-none' : '',
        ].join(' ')}
      >
        <div className="text-5xl mb-3">{full ? '✅' : '📸'}</div>
        <p className="text-base font-semibold text-gray-800">
          {full ? 'Maximum 100 photos reached' : 'Tap to add photos'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {full ? 'Remove some photos to add more' : 'Or drag & drop images here'}
        </p>
        <div className="mt-3 inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600 font-medium">
          {photos.length} / {MAX_PHOTOS}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} · drag to reorder
            </h2>
            <button
              onClick={() => {
                photos.forEach(p => URL.revokeObjectURL(p.url))
                setPhotos([])
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((photo, idx) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                index={idx}
                isDropTarget={dropTargetIdx === idx}
                onRemove={() => removePhoto(photo.id)}
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={() => setDropTargetIdx(idx)}
                onDrop={() => handleThumbDrop(idx)}
                onDragEnd={() => { setDraggedIdx(null); setDropTargetIdx(null) }}
              />
            ))}
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <button
          onClick={onNext}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          Continue to Layout →
        </button>
      )}
    </div>
  )
}

function PhotoThumb({ photo, index, isDropTarget, onRemove, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDrop={(e) => { e.preventDefault(); onDrop() }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        'relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-move transition-all',
        isDropTarget ? 'ring-2 ring-indigo-400 scale-105' : '',
      ].join(' ')}
    >
      <img src={photo.url} alt="" draggable={false} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4">
        <span className="text-white text-xs font-medium">{index + 1}</span>
      </div>
      {hovered && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  )
}
