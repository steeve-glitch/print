import { useState, useRef } from 'react'
import { ExternalLink, FileText, Loader } from 'lucide-react'
import { useStorage } from '../hooks/useStorage'

export default function DocumentPreviewLink({ url, documentName, label }) {
  const { viewFile, getAuthenticatedUrl } = useStorage()
  const [preview, setPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewTimerRef = useRef(null)

  const isR2 = url?.includes(import.meta.env.VITE_WORKER_URL)

  const handleView = (e) => {
    if (isR2) {
      e.preventDefault()
      viewFile(url, documentName)
    }
  }

  const handleMouseEnter = async () => {
    if (!isR2) return
    setShowPreview(true)
    if (preview) return

    previewTimerRef.current = setTimeout(async () => {
      setLoadingPreview(true)
      const data = await getAuthenticatedUrl(url)
      setPreview(data)
      setLoadingPreview(false)
    }, 400)
  }

  const handleMouseLeave = () => {
    setShowPreview(false)
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
  }

  return (
    <div className="relative inline-block group">
      <a
        href={url}
        onClick={handleView}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
      >
        <ExternalLink size={12} />
        {label}
      </a>

      {showPreview && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 pointer-events-none transition-opacity">
          {loadingPreview ? (
            <div className="flex items-center justify-center py-4">
              <Loader size={16} className="animate-spin text-blue-500" />
            </div>
          ) : preview ? (
            <div className="space-y-2">
              {preview.type.startsWith('image/') ? (
                <img
                  src={preview.blobUrl}
                  alt="Preview"
                  className="w-full h-32 object-contain rounded bg-gray-50"
                />
              ) : preview.type === 'application/pdf' ? (
                <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-50 rounded">
                  <FileText size={32} className="text-red-500 mb-1" />
                  <span className="text-[10px] text-gray-500">PDF Document</span>
                </div>
              ) : (
                <div className="w-full h-24 flex flex-col items-center justify-center bg-gray-50 rounded">
                  <FileText size={24} className="text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500">{preview.type}</span>
                </div>
              )}
              <div className="px-1">
                <p className="text-[10px] text-gray-400 truncate">{documentName}</p>
                <p className="text-[10px] text-gray-400">{(preview.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 py-2 px-1">No preview available</p>
          )}
        </div>
      )}
    </div>
  )
}
