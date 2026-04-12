import { useState } from 'react'
import { CheckCheck, Inbox, Loader } from 'lucide-react'
import { useT } from '../i18n'
import { useRequests } from '../hooks/useRequests'
import { useToast } from '../components/Toast'
import RequestCard from '../components/RequestCard'

// Handles both legacy numeric timestamps and Firestore Timestamps
const toMs = (ts) => {
  if (!ts) return 0
  if (typeof ts === 'number') return ts
  return ts.toMillis?.() ?? 0
}

export default function HODDashboard({ user, role, department }) {
  const { t } = useT()
  const { showToast } = useToast()
  const { requests, loading, updateRequest } = useRequests(user)
  const [tab, setTab] = useState('pending')

  const scopeByDept = (reqs) => {
    if (role === 'admin' || !department) return reqs
    return reqs.filter((r) => r.department === department)
  }

  const pending = scopeByDept(
    requests
      .filter((r) => r.status === 'pending_hod')
      .sort((a, b) => new Date(a.neededBy) - new Date(b.neededBy))
  )

  const history = scopeByDept(
    requests
      .filter((r) => r.status !== 'pending_hod')
      .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
  )

  const handleApprove = async (id) => {
    try {
      await updateRequest(id, { status: 'approved', hodComment: '' })
      showToast(t.toastApproved)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  const handleReject = async (id, comment) => {
    try {
      await updateRequest(id, { status: 'rejected', hodComment: comment })
      showToast(t.toastRejected)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.hodTitle}</h2>
        <p className="text-gray-500 text-sm mt-1">{t.hodSubtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.pendingTab}
          {pending.length > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.historyTab}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {tab === 'pending' && (
            <div className="space-y-3">
              {pending.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <CheckCheck size={48} className="mx-auto mb-4 opacity-25" />
                  <p className="text-sm">{t.noPending}</p>
                </div>
              ) : (
                pending.map((req) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    showActions={true}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Inbox size={48} className="mx-auto mb-4 opacity-25" />
                  <p className="text-sm">{t.noHistory}</p>
                </div>
              ) : (
                history.map((req) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    showActions={false}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
