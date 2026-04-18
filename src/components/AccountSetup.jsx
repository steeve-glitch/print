import { useState } from 'react'
import { Printer } from 'lucide-react'
import { useT } from '../i18n'
import { DEPARTMENTS } from '../constants'

const ROLES = ['teacher', 'hod', 'printer']

export default function AccountSetup({ user, onSetup }) {
  const { t } = useT()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: user.displayName || '',
    role: '',
    department: '',
    notificationFrequency: 'instant',
  })

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const needsDepartment = form.role === 'teacher' || form.role === 'hod'

  const isValid =
    form.name.trim() &&
    form.role &&
    (!needsDepartment || form.department)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    try {
      await onSetup({
        name: form.name.trim(),
        role: form.role,
        department: needsDepartment ? form.department : null,
        notificationFrequency: form.notificationFrequency,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const roleLabels = {
    teacher: t.roleTeacher,
    hod: t.roleHod,
    printer: t.rolePrinter,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Printer className="text-blue-600" size={36} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">{t.setupTitle}</h1>
        <p className="text-gray-500 text-sm mb-8 text-center">{t.setupSubtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.roleLabel}
            </label>
            <select
              value={form.role}
              onChange={set('role')}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white"
            >
              <option value="">{t.selectRolePlaceholder}</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>

          {/* Department — shown for teacher and hod */}
          {needsDepartment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.departmentLabel}
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
          )}

          {/* Notifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.notificationLabel}
            </label>
            <select
              value={form.notificationFrequency}
              onChange={set('notificationFrequency')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white"
            >
              <option value="instant">{t.notifyInstant}</option>
              <option value="never">{t.notifyNever}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors text-sm mt-2"
          >
            {submitting ? t.loading : t.completeSetup}
          </button>
        </form>
      </div>
    </div>
  )
}
