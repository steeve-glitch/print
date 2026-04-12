import { useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../i18n'
import { DEPARTMENTS } from '../constants'

export default function NewRequestModal({ onSubmit, onClose }) {
  const { t } = useT()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    documentName: '',
    googleDriveLink: '',
    copies: 1,
    color: false,
    doubleSided: false,
    neededBy: '',
    department: '',
  })

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ ...form, copies: parseInt(form.copies, 10) })
    } finally {
      setSubmitting(false)
    }
  }

  const isValid =
    form.documentName.trim() &&
    form.googleDriveLink.trim() &&
    Number(form.copies) > 0 &&
    form.neededBy &&
    form.department.trim()

  const today = new Date().toISOString().split('T')[0]

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

          {/* Google Drive Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.driveLinkLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.googleDriveLink}
              onChange={set('googleDriveLink')}
              placeholder={t.driveLinkPlaceholder}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
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

          {/* Color toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.colorLabel}
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color: true }))}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.color
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.colorOption}
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color: false }))}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  !form.color
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.bwOption}
              </button>
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
              {submitting ? t.submitting : t.submitRequest}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
