import { useState } from 'react'
import { X, Monitor, Pencil, Trash2, Ban } from 'lucide-react'
import { PERIODS, TOTAL_PCS, isPrinterRole } from '../constants'
import { useT } from '../i18n'

export default function ReservationModal({
  date, period, existingReservations, userReservation, blockInfo, role,
  onReserve, onDelete, onPatch, onBlock, onUnblock, onClose,
}) {
  const { t } = useT()
  const periodInfo = PERIODS.find(p => p.id === period)
  const totalReserved = existingReservations.reduce((s, r) => s + r.pcCount, 0)
  const remaining = TOTAL_PCS - totalReserved

  const [pcCount, setPcCount] = useState(Math.min(5, Math.max(1, remaining)))
  const [notes, setNotes] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editCount, setEditCount] = useState(1)
  const [editNotes, setEditNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const isPrinter = isPrinterRole(role)

  const handleBlock = async () => {
    setSubmitting(true)
    try { await onBlock({ reason: blockReason }) }
    finally { setSubmitting(false) }
  }

  const handleReserve = async () => {
    setSubmitting(true)
    try {
      await onReserve({ pcCount, notes })
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (r) => {
    setEditingId(r.id)
    setEditCount(r.pcCount)
    setEditNotes(r.notes || '')
  }

  const handlePatch = async (id) => {
    setSubmitting(true)
    try {
      await onPatch(id, { pcCount: editCount, notes: editNotes })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="font-semibold text-gray-900">
              {periodInfo?.label} · {periodInfo?.time}
            </h2>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className={`flex items-center gap-1.5 ${remaining <= 0 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                <Monitor size={14} />
                {remaining} / {TOTAL_PCS} {t.available}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  totalReserved / TOTAL_PCS >= 1 ? 'bg-red-400' :
                  totalReserved / TOTAL_PCS >= 0.7 ? 'bg-orange-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min(100, (totalReserved / TOTAL_PCS) * 100)}%` }}
              />
            </div>
          </div>

          {blockInfo && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <Ban size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700">{t.periodBlockedMsg}</p>
                {blockInfo.reason ? <p className="text-xs text-red-500 mt-0.5">{blockInfo.reason}</p> : null}
              </div>
              {isPrinter && (
                <button
                  onClick={() => onUnblock(blockInfo.id)}
                  className="text-xs bg-white border border-red-200 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded font-medium shrink-0 transition-colors"
                >
                  {t.unblockPeriod}
                </button>
              )}
            </div>
          )}

          {existingReservations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.currentReservations}</p>
              {existingReservations.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-lg border px-3 py-2 ${
                    r.id === userReservation?.id ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {editingId === r.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={TOTAL_PCS - existingReservations.filter(x => x.id !== r.id).reduce((s, x) => s + x.pcCount, 0)}
                          value={editCount}
                          onChange={e => setEditCount(Math.max(1, Number(e.target.value)))}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <span className="text-sm text-gray-500">PCs</span>
                      </div>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder={t.reservationNotesPlaceholder}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePatch(r.id)}
                          disabled={submitting}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
                        >
                          {t.save}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{r.teacherName}</p>
                        <p className="text-xs text-gray-500">{r.department}{r.notes ? ` · ${r.notes}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="text-sm font-semibold text-blue-600">{r.pcCount} PCs</span>
                        {isPrinter && (
                          <>
                            <button onClick={() => startEdit(r)} className="text-gray-400 hover:text-blue-600">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => onDelete(r.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!userReservation && remaining > 0 && !blockInfo && (
            <div className={existingReservations.length > 0 ? 'border-t border-gray-100 pt-4 space-y-3' : 'space-y-3'}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.reservePcs}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.pcCount}{' '}
                  <span className="text-xs text-gray-400">({t.maxAvailable}: {remaining})</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={remaining}
                  value={pcCount}
                  onChange={e => setPcCount(Math.max(1, Math.min(remaining, Number(e.target.value))))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.reservationNotesLabel}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t.reservationNotesPlaceholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <button
                onClick={handleReserve}
                disabled={submitting || pcCount < 1}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {submitting ? t.submitting : t.confirmReservation}
              </button>
            </div>
          )}

          {userReservation && !isPrinter && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => onDelete(userReservation.id)}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                <Trash2 size={15} />
                {t.cancelReservation}
              </button>
            </div>
          )}

          {remaining <= 0 && !userReservation && !blockInfo && (
            <p className="text-sm text-red-500 text-center py-2 bg-red-50 rounded-lg">{t.reservationFull}</p>
          )}

          {isPrinter && !blockInfo && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.blockPeriod}</p>
              <input
                type="text"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder={t.blockReasonPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <button
                onClick={handleBlock}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <Ban size={14} />
                {t.blockPeriod}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
