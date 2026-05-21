import { useState } from 'react'
import { Printer, Clock, AlertCircle, ExternalLink, CheckSquare, Loader, Monitor } from 'lucide-react'
import { useT } from '../i18n'
import { useRequests } from '../hooks/useRequests'
import { useStorage } from '../hooks/useStorage'
import { useToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import ReservationGrid from '../components/ReservationGrid'

export default function PrinterDashboard({ user, userName, department }) {
  const { t } = useT()
  const { viewFile } = useStorage()
  const { showToast } = useToast()
  const { requests, loading, updateRequest } = useRequests(user, 'printer')
  const [view, setView] = useState('queue')

  const handleView = (e, req) => {
    const isR2 = req.googleDriveLink?.includes(import.meta.env.VITE_WORKER_URL)
    if (isR2) {
      e.preventDefault()
      viewFile(req.googleDriveLink, req.documentName)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const queue = requests
    .filter((r) => r.status === 'approved' || r.status === 'printing')
    .sort((a, b) => new Date(a.neededBy) - new Date(b.neededBy))

  const getUrgency = (neededBy) => {
    if (neededBy < today) return 'overdue'
    if (neededBy === today) return 'today'
    return null
  }

  const handleStartPrinting = async (id) => {
    try {
      const request = requests.find((r) => r.id === id)
      await updateRequest(id, { status: 'printing' }, request)
      showToast(t.toastPrinting)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  const handleMarkReady = async (id) => {
    try {
      const request = requests.find((r) => r.id === id)
      await updateRequest(id, { status: 'ready' }, request)
      showToast(t.toastReady)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.printerTitle}</h2>
        <p className="text-gray-500 text-sm mt-1">{t.printerSubtitle}</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setView('queue')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            view === 'queue' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.printRequestsTab}
        </button>
        <button
          onClick={() => setView('computers')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            view === 'computers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor size={14} />
          {t.computersTab}
        </button>
      </div>

      {view === 'computers' && (
        <ReservationGrid user={user} userName={userName} role="printer" department={department} />
      )}

      {view === 'queue' && (loading ? (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-gray-300" />
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Printer size={48} className="mx-auto mb-4 opacity-25" />
          <p className="text-sm">{t.noQueue}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((req) => {
            const urgency = getUrgency(req.neededBy)
            return (
              <div
                key={req.id}
                className={`bg-white border rounded-xl p-4 space-y-3 ${
                  urgency === 'overdue'
                    ? 'border-red-200 bg-red-50'
                    : urgency === 'today'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200'
                }`}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {req.documentName}
                      </p>
                      {urgency === 'overdue' && (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                          <AlertCircle size={10} />
                          {t.overdue}
                        </span>
                      )}
                      {urgency === 'today' && (
                        <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
                          <Clock size={10} />
                          {t.dueToday}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {req.requesterName} · {req.department}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                {/* Specs row */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-sm font-medium">
                    {req.copies}×
                  </span>
                  {req.size && (
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {req.size}
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                    {req.doubleSided ? t.doubleSided : t.singleSided}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 text-xs self-center">
                    <Clock size={12} />
                    {req.neededBy}
                  </span>
                </div>

                {req.googleDriveLink && (
                  <a
                    href={req.googleDriveLink}
                    onClick={(e) => handleView(e, req)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={13} />
                    {t.viewDocument}
                  </a>
                )}

                {/* Action button */}
                <div>
                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleStartPrinting(req.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      <Printer size={15} />
                      {t.startPrinting}
                    </button>
                  )}
                  {req.status === 'printing' && (
                    <button
                      onClick={() => handleMarkReady(req.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      <CheckSquare size={15} />
                      {t.markReady}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
