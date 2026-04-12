import { useState } from 'react'
import { Plus, Package, Clock, ExternalLink, Loader } from 'lucide-react'
import { useT } from '../i18n'
import { useRequests } from '../hooks/useRequests'
import { useToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import NewRequestModal from '../components/NewRequestModal'

export default function TeacherDashboard({ user, userName, department }) {
  const { t } = useT()
  const { showToast } = useToast()
  const { requests, loading, createRequest, updateRequest } = useRequests(user)
  const [showModal, setShowModal] = useState(false)

  const myRequests = requests
    .filter((r) => r.requesterId === user.uid)
    .sort((a, b) => {
      if (a.status === 'ready' && b.status !== 'ready') return -1
      if (b.status === 'ready' && a.status !== 'ready') return 1
      return new Date(a.neededBy) - new Date(b.neededBy)
    })

  const readyRequests = myRequests.filter((r) => r.status === 'ready')
  const otherRequests = myRequests.filter((r) => r.status !== 'ready')

  const handleCollect = async (id) => {
    try {
      await updateRequest(id, { status: 'collected' })
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.teacherTitle}</h2>
          <p className="text-gray-500 text-sm mt-1">{t.teacherSubtitle}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shrink-0"
        >
          <Plus size={18} />
          {t.newRequest}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-gray-300" />
        </div>
      )}

      {/* Ready for pickup banner */}
      {!loading && readyRequests.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <Package size={18} />
            {t.readyForPickup}
          </h3>
          <div className="space-y-2">
            {readyRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-green-100 p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {req.documentName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {req.copies} {t.copies} · {req.department}
                  </p>
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

      {/* Requests list */}
      {!loading && myRequests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Clock size={48} className="mx-auto mb-4 opacity-25" />
          <p className="text-sm">{t.noRequests}</p>
        </div>
      ) : !loading && otherRequests.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  {t.docName}
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                  {t.copies}
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                  {t.neededBy}
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  {t.status}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {otherRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-48">
                      {req.documentName}
                    </p>
                    <p className="text-xs text-gray-400">{req.department}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {req.copies}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {req.neededBy}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                    {req.hodComment && req.status === 'rejected' && (
                      <p className="text-xs text-red-500 mt-1 italic">
                        &ldquo;{req.hodComment}&rdquo;
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {req.googleDriveLink && (
                      <a
                        href={req.googleDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 inline-flex"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

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
