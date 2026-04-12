import { useState } from 'react'
import { ShieldX, LogOut, Copy, Check } from 'lucide-react'
import { useT } from '../i18n'

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 text-left">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-mono text-gray-800 break-all flex-1">{value}</p>
        <button onClick={copy} className="text-gray-400 hover:text-gray-600 shrink-0">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function NoAccess({ user, onSignOut }) {
  const { t } = useT()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-5">
          <div className="bg-yellow-100 p-4 rounded-full">
            <ShieldX className="text-yellow-600" size={36} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.noAccessTitle}</h1>
        <p className="text-gray-500 text-sm mb-5">{t.noAccessMessage}</p>

        <div className="space-y-2 mb-6 text-left">
          <CopyField label="Email" value={user.email} />
          <CopyField label="UID (for Firestore)" value={user.uid} />
        </div>

        <p className="text-xs text-gray-400 mb-5">
          In Firestore console, create{' '}
          <code className="bg-gray-100 px-1 rounded">users/{user.uid}</code> with{' '}
          <code className="bg-gray-100 px-1 rounded">{'{ role: "teacher" }'}</code>
        </p>

        <button
          onClick={onSignOut}
          className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          {t.signOut}
        </button>
      </div>
    </div>
  )
}
