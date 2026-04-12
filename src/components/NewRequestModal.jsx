import { useState, useRef } from 'react'
import { X, UploadCloud, FileText } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useT } from '../i18n'
import { DEPARTMENTS } from '../constants'
import { storage, auth } from '../firebase'

export default function NewRequestModal({ onSubmit, onClose, defaultDepartment }) {
  const { t } = useT()
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState('link') // 'link' | 'upload'
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    documentName: '',
    googleDriveLink: '',
    copies: 1,
    color: false,
    size: 'A4',
    doubleSided: false,
    neededBy: '',
    department: defaultDepartment || '',
  })

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const pickFile = (f) => {
    if (f) setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let docUrl = form.googleDriveLink
      if (mode === 'upload' && file) {
        const uid = auth.currentUser?.uid ?? 'unknown'
        const storageRef = ref(storage, `uploads/${uid}/${Date.now()}_${file.name}`)
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timed out — Firebase Storage may not be enabled on this project.')), 15000)
        )
        await Promise.race([uploadBytes(storageRef, file), timeout])
        docUrl = await getDownloadURL(storageRef)
      }
      await onSubmit({ ...form, copies: parseInt(form.copies, 10), googleDriveLink: docUrl })
    } finally {
      setSubmitting(false)
    }
  }

  const isValid =
    form.documentName.trim() &&
    (mode === 'link' ? form.googleDriveLink.trim() : !!file) &&
    Number(form.copies) > 0 &&
    form.neededBy &&
    form.department.trim()

  const today = new Date().toISOString().split('T')[0]

  const submitLabel = submitting
    ? (mode === 'upload' && file ? t.uploading : t.submitting)
    : t.submitRequest

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl sm:rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">{t.modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.docNameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.documentName}
              onChange={set('documentName')}
              placeholder={t.docNamePlaceholder}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
          </div>

          {/* Document source — tab toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.driveLinkLabel} <span className="text-red-500">*</span>
            </label>

            {/* Tabs */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setMode('link')}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'link'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t.tabDriveLink}
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t.tabUpload}
              </button>
            </div>

            {mode === 'link' ? (
              <input
                type="url"
                value={form.googleDriveLink}
                onChange={set('googleDriveLink')}
                placeholder={t.driveLinkPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
            ) : (
              <div>
                {file ? (
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-blue-50">
                    <FileText size={16} className="text-blue-500 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      <span className="text-gray-400 mr-1">{t.fileSelected}</span>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
                      dragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <UploadCloud
                      size={28}
                      className={`mx-auto mb-2 ${dragging ? 'text-blue-400' : 'text-gray-300'}`}
                    />
                    <p className="text-sm text-gray-500">
                      {dragging ? t.dropZoneActive : t.dropZoneText}
                    </p>
                    {!dragging && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t.dropZoneOr}{' '}
                        <span className="text-blue-500 underline">{t.dropZoneBrowse}</span>
                      </p>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files[0])}
                />
              </div>
            )}
          </div>

          {/* Copies + Needed By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.copiesLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.copies}
                onChange={set('copies')}
                min="1"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.neededByLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.neededBy}
                onChange={set('neededBy')}
                required
                min={today}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Paper size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.sizeLabel}
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {['A4', 'Letter', 'Office'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, size: s }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    form.size === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Double-sided toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t.doubleSidedLabel}
            </label>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, doubleSided: !prev.doubleSided }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.doubleSided ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  form.doubleSided ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.departmentLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.department}
              onChange={set('department')}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white"
            >
              <option value="">{t.selectDepartmentPlaceholder}</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
