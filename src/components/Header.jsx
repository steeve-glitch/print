import { Printer, LogOut } from 'lucide-react'
import { useT } from '../i18n'

const roleConfig = {
  teacher: { key: 'roleBadgeTeacher', style: 'bg-blue-100 text-blue-800' },
  hod: { key: 'roleBadgeHod', style: 'bg-purple-100 text-purple-800' },
  printer: { key: 'roleBadgePrinter', style: 'bg-green-100 text-green-800' },
  admin: { key: 'roleBadgeAdmin', style: 'bg-orange-100 text-orange-800' },
}

export default function Header({ user, role, isAdmin, onRoleChange, userName, onSignOut }) {
  const { t, lang, toggleLang } = useT()
  const cfg = roleConfig[role] || { key: null, style: 'bg-gray-100 text-gray-700' }
  const displayName = userName || user?.displayName || user?.email || ''

  const handleRoleChange = (e) => {
    onRoleChange(e.target.value)
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <Printer className="text-blue-600" size={22} />
          <span className="font-bold text-gray-900 text-lg leading-none">{t.appName}</span>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {isAdmin ? (
            <select
              value={role}
              onChange={handleRoleChange}
              className={`text-xs font-medium px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${cfg.style}`}
            >
              <option value="admin">{t.roleBadgeAdmin}</option>
              <option value="hod">{t.roleBadgeHod}</option>
              <option value="printer">{t.roleBadgePrinter}</option>
              <option value="teacher">{t.roleBadgeTeacher}</option>
            </select>
          ) : (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.style}`}
            >
              {cfg.key ? t[cfg.key] : role}
            </span>
          )}

          <span className="text-sm text-gray-600 truncate hidden sm:block max-w-40">
            {displayName}
          </span>

          <button
            onClick={toggleLang}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-300 rounded px-2 py-1 transition-colors shrink-0"
            title="Toggle language"
          >
            {lang === 'en' ? 'ES' : 'EN'}
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors shrink-0"
            title={t.signOut}
          >
            <LogOut size={16} />
            <span className="hidden sm:block">{t.signOut}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
