import { useState } from 'react'
import { CheckCheck, Inbox, Loader, Plus, Package, Clock, Trash2, CheckSquare, Square, Monitor } from 'lucide-react'
import { useT } from '../i18n'
import { useRequests } from '../hooks/useRequests'
import { useToast } from '../components/Toast'
import RequestCard from '../components/RequestCard'
import StatusBadge from '../components/StatusBadge'
import NewRequestModal from '../components/NewRequestModal'
import DocumentPreviewLink from '../components/DocumentPreviewLink'
import ReservationGrid from '../components/ReservationGrid'
import { deleteFileByUrl } from '../firebase'

// Handles both legacy numeric timestamps and Firestore Timestamps
const toMs = (ts) => {
  if (!ts) return 0
  if (typeof ts === 'number') return ts
  return ts.toMillis?.() ?? 0
}

export default function HODDashboard({ user, userName, role, department }) {
  const { t } = useT()
  const { showToast } = useToast()
  const { requests, loading, createRequest, updateRequest, bulkUpdate, deleteRequest } = useRequests(user, role, department)
  const [tab, setTab] = useState('pending')
  const [showModal, setShowModal] = useState(false)
  const [cleaning, setCleaning] = useState(false)

  const isAdmin = role === 'admin'

  const handleCleanup = async () => {
    if (!window.confirm('This will permanently delete ALL requests pointing to Firebase (firebasestorage or appspot). Continue?')) return
    setCleaning(true)
    try {
      const legacy = requests.filter(r => 
        r.googleDriveLink?.includes('firebasestorage') || 
        r.googleDriveLink?.includes('appspot.com')
      )
      const promises = legacy.map(r => deleteRequest(r.id))
      await Promise.all(promises)
      showToast(`Cleaned up ${legacy.length} legacy requests`)
    } catch {
      showToast('Cleanup failed', 'error')
    } finally {
      setCleaning(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected requests? This cannot be undone.`)) return
    
    try {
      const promises = selectedIds.map(id => deleteRequest(id))
      await Promise.all(promises)
      showToast(`${selectedIds.length} requests deleted permanently`)
      setSelectedIds([])
    } catch {
      showToast('Deletion failed', 'error')
    }
  }

  const [selectedIds, setSelectedIds] = useState([])

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

  const myRequests = requests
    .filter((r) => r.requesterId === user.uid)
    .sort((a, b) => {
      if (a.status === 'ready' && b.status !== 'ready') return -1
      if (b.status === 'ready' && a.status !== 'ready') return 1
      return new Date(a.neededBy) - new Date(b.neededBy)
    })

  const myReady = myRequests.filter((r) => r.status === 'ready')
  const myActive = myRequests.filter((r) => r.status !== 'ready' && r.status !== 'collected')

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAllReady = () => {
    if (selectedIds.length === myReady.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(myReady.map(r => r.id))
    }
  }

  const handleBulkCollect = async () => {
    if (selectedIds.length === 0) return
    try {
      await bulkUpdate(selectedIds, { status: 'collected' })
      showToast(t.toastCollected)
      setSelectedIds([])
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  const handleApprove = async (id) => {
    try {
      const request = requests.find((r) => r.id === id)
      await updateRequest(id, { status: 'approved', hodComment: '' }, request)
      showToast(t.toastApproved)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  const handleReject = async (id, comment) => {
    try {
      const request = requests.find((r) => r.id === id)
      await updateRequest(id, { status: 'rejected', hodComment: comment }, request)
      if (request?.googleDriveLink) {
        await deleteFileByUrl(request.googleDriveLink)
      }
      showToast(t.toastRejected)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  const handleCollect = async (id) => {
    try {
      const request = requests.find((r) => r.id === id)
      await updateRequest(id, { status: 'collected' }, request)
      if (request?.googleDriveLink) {
        await deleteFileByUrl(request.googleDriveLink)
      }
      showToast(t.toastCollected)
    } catch {
      showToast(t.toastUpdateError, 'error')
    }
  }

  const handleCreate = async (data) => {
    try {
      await createRequest(data, user, userName)
      setShowModal(false)
      showToast(t.toastSubmitted)
    } catch {
      showToast(t.toastError, 'error')
    }
  }

  const tabs = [
    { key: 'pending', label: t.pendingTab, badge: pending.length },
    { key: 'history', label: t.historyTab },
    { key: 'mine', label: t.myRequestsTab, badge: myReady.length || undefined },
    { key: 'computers', label: t.computersTab, icon: Monitor },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.hodTitle}</h2>
          <p className="text-gray-500 text-sm mt-1">{t.hodSubtitle}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-medium transition-colors shrink-0 disabled:opacity-50"
            >
              <Trash2 size={18} />
              {cleaning ? 'Cleaning...' : 'Cleanup Legacy'}
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shrink-0"
          >
            <Plus size={18} />
            {t.newRequest}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(({ key, label, badge, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {Icon && <Icon size={14} />}
            {label}
            {badge > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                key === 'mine' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && tab !== 'computers' ? (
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

          {tab === 'computers' && (
            <ReservationGrid user={user} userName={userName} role={role} department={department} />
          )}

          {tab === 'mine' && (
            <div className="space-y-4">
              {/* Ready for pickup */}
              {myReady.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2">
                      <Package size={18} />
                      {t.readyForPickup}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllReady}
                        className="text-[10px] bg-white border border-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-100 transition-colors font-medium"
                      >
                        {selectedIds.length === myReady.length ? 'Deselect All' : 'Select All'}
                      </button>
                      {selectedIds.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={handleBulkCollect}
                            className="text-[10px] bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors font-bold flex items-center gap-1"
                          >
                            Mark Collected ({selectedIds.length})
                          </button>
                          {isAdmin && (
                            <button
                              onClick={handleBulkDelete}
                              className="text-[10px] bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors font-bold flex items-center gap-1"
                            >
                              <Trash2 size={10} />
                              Delete ({selectedIds.length})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {myReady.map((req) => (
                      <div
                        key={req.id}
                        className={`bg-white rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                          selectedIds.includes(req.id) ? 'border-green-500 bg-green-50/50' : 'border-green-100'
                        }`}
                      >
                        <button 
                          onClick={() => toggleSelect(req.id)}
                          className={`shrink-0 ${selectedIds.includes(req.id) ? 'text-green-600' : 'text-gray-300'}`}
                        >
                          {selectedIds.includes(req.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">{req.documentName}</p>
                            {(req.googleDriveLink?.includes('firebasestorage') || req.googleDriveLink?.includes('appspot.com')) && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">LEGACY</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{req.copies} {t.copies} · {req.size || 'A4'}</p>
                          {req.googleDriveLink && (
                            <div className="mt-1">
                              <DocumentPreviewLink 
                                url={req.googleDriveLink} 
                                documentName={req.documentName} 
                                label={t.viewDocument} 
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleCollect(req.id)}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
                        >
                          {t.markCollected}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active requests table */}
              {myRequests.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Clock size={48} className="mx-auto mb-4 opacity-25" />
                  <p className="text-sm">{t.noRequests}</p>
                </div>
              ) : myActive.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t.docName}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">{t.copies}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t.neededBy}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t.status}</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {myActive.map((req) => (
                        <tr key={req.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 truncate max-w-48">{req.documentName}</p>
                            <p className="text-xs text-gray-400">{req.size || 'A4'} · {req.department}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{req.copies}</td>
                          <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{req.neededBy}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={req.status} />
                            {req.hodComment && req.status === 'rejected' && (
                              <p className="text-xs text-red-500 mt-1 italic">&ldquo;{req.hodComment}&rdquo;</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {req.googleDriveLink && (
                              <DocumentPreviewLink 
                                url={req.googleDriveLink} 
                                documentName={req.documentName} 
                                label="" 
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {showModal && (
        <NewRequestModal
          onSubmit={handleCreate}
          onClose={() => setShowModal(false)}
          defaultDepartment={department}
        />
      )}
    </div>
  )
}
