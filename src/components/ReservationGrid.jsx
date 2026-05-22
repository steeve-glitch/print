import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Monitor, Loader, Ban } from 'lucide-react'
import { PERIODS } from '../constants'
import { useReservations } from '../hooks/useReservations'
import { useToast } from './Toast'
import { useT } from '../i18n'
import ReservationModal from './ReservationModal'

const TOTAL_PCS = 30
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getWeekDates(anchor) {
  const d = new Date(anchor + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date.toISOString().split('T')[0]
  })
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function ReservationGrid({ user, userName, role, department }) {
  const { t } = useT()
  const { showToast } = useToast()
  const [weekAnchor, setWeekAnchor] = useState(todayStr)
  const weekDates = getWeekDates(weekAnchor)
  const [modalInfo, setModalInfo] = useState(null)

  const {
    reservations, blockedPeriods, loading,
    fetchReservations, createReservation, deleteReservation, patchReservation,
    blockPeriod, unblockPeriod,
  } = useReservations(user, role)

  const isPrinter = role === 'printer' || role === 'admin'
  const getBlock = (date, periodId) => blockedPeriods.find(b => b.date === date && b.period === periodId)

  const refresh = useCallback(() => {
    fetchReservations(weekDates[0], weekDates[4])
  }, [fetchReservations, weekDates[0], weekDates[4]])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 10000)
    return () => clearInterval(interval)
  }, [refresh])

  const cellReservations = (date, periodId) =>
    reservations.filter(r => r.date === date && r.period === periodId)

  const cellTotal = (date, periodId) =>
    cellReservations(date, periodId).reduce((s, r) => s + r.pcCount, 0)

  const userReservation = (date, periodId) =>
    reservations.find(r => r.date === date && r.period === periodId && r.teacherId === user.uid)

  const shiftWeek = (direction) => {
    const d = new Date(weekDates[0] + 'T12:00:00')
    d.setDate(d.getDate() + direction * 7)
    setWeekAnchor(d.toISOString().split('T')[0])
  }

  const handleReserve = async ({ pcCount, notes }) => {
    try {
      await createReservation({
        date: modalInfo.date,
        period: modalInfo.period,
        pcCount,
        teacherName: userName || user.displayName || '',
        department,
        notes,
      })
      refresh()
      setModalInfo(null)
      showToast(t.reservationSuccess)
    } catch (err) {
      showToast(err.message === 'Not enough PCs available' ? t.reservationFull : t.reservationError, 'error')
      throw err
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteReservation(id)
      refresh()
      setModalInfo(null)
      showToast(t.reservationCancelled)
    } catch {
      showToast(t.toastError, 'error')
    }
  }

  const handlePatch = async (id, updates) => {
    try {
      await patchReservation(id, updates)
      refresh()
      setModalInfo(null)
      showToast(t.reservationSuccess)
    } catch (err) {
      showToast(err.message || t.toastError, 'error')
      throw err
    }
  }

  const handleBlock = async ({ reason }) => {
    try {
      await blockPeriod({ date: modalInfo.date, period: modalInfo.period, reason })
      refresh()
      setModalInfo(null)
      showToast(t.toastBlocked)
    } catch {
      showToast(t.toastError, 'error')
    }
  }

  const handleUnblock = async (id) => {
    try {
      await unblockPeriod(id)
      refresh()
      setModalInfo(null)
      showToast(t.toastUnblocked)
    } catch {
      showToast(t.toastError, 'error')
    }
  }

  const today = todayStr()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.reservationsTitle}</h2>
          <p className="text-gray-500 text-sm mt-1">{t.reservationsSubtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftWeek(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setWeekAnchor(todayStr())}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 text-gray-600 font-medium transition-colors"
          >
            {t.today}
          </button>
          <button
            onClick={() => shiftWeek(1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[560px] text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 bg-gray-50 border-b border-r border-gray-200 w-24">
                  Period
                </th>
                {weekDates.map((date, i) => (
                  <th
                    key={date}
                    className={`px-3 py-2.5 font-medium text-center border-b border-r last:border-r-0 border-gray-200 ${
                      date === today ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-xs font-normal opacity-75">{fmtDate(date)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, pi) => (
                <tr key={period.id}>
                  <td className={`px-3 py-2 border-r border-gray-200 bg-gray-50 ${pi < PERIODS.length - 1 ? 'border-b' : ''}`}>
                    <div className="font-medium text-gray-700 text-xs">{period.label}</div>
                    <div className="text-xs text-gray-400">{period.time}</div>
                  </td>
                  {weekDates.map((date) => {
                    const total = cellTotal(date, period.id)
                    const cells = cellReservations(date, period.id)
                    const fillPct = (total / TOTAL_PCS) * 100
                    const isPast = date < today
                    const block = getBlock(date, period.id)
                    const isBlocked = !!block
                    const canClick = !isPast && (isPrinter || !isBlocked)

                    return (
                      <td
                        key={date}
                        onClick={() => canClick && setModalInfo({ date, period: period.id })}
                        className={`px-2 py-2 border-r last:border-r-0 border-gray-200 transition-colors align-top ${
                          pi < PERIODS.length - 1 ? 'border-b' : ''
                        } ${
                          isPast
                            ? 'bg-gray-50/60 opacity-60 cursor-default'
                            : isBlocked
                            ? isPrinter
                              ? 'bg-red-50 cursor-pointer hover:bg-red-100'
                              : 'bg-red-50 cursor-not-allowed'
                            : date === today
                            ? 'bg-blue-50/20 cursor-pointer hover:bg-blue-50'
                            : 'bg-white cursor-pointer hover:bg-gray-50'
                        }`}
                      >
                        {isBlocked ? (
                          <div className="flex flex-col items-center justify-center min-h-[40px] gap-0.5">
                            <Ban size={13} className="text-red-300" />
                            <span className="text-[10px] text-red-400 font-medium">{t.blockedLabel}</span>
                            {block.reason ? (
                              <span className="text-[10px] text-red-300 truncate max-w-full px-1 text-center leading-tight">{block.reason}</span>
                            ) : null}
                          </div>
                        ) : total > 0 ? (
                          <div className="space-y-1 min-h-[40px]">
                            <div className="flex items-center gap-1">
                              <div className="flex-1 bg-gray-100 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    fillPct >= 100 ? 'bg-red-400' : fillPct >= 70 ? 'bg-orange-400' : 'bg-blue-400'
                                  }`}
                                  style={{ width: `${Math.min(100, fillPct)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">{total}/{TOTAL_PCS}</span>
                            </div>
                            {cells.map((r) => (
                              <div
                                key={r.id}
                                className={`text-[11px] px-1.5 py-0.5 rounded truncate ${
                                  r.teacherId === user.uid
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {r.teacherName?.split(' ')[0]} · {r.pcCount}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center min-h-[40px] text-gray-200 hover:text-blue-300 transition-colors">
                            {!isPast && <Monitor size={14} />}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalInfo && (
        <ReservationModal
          date={modalInfo.date}
          period={modalInfo.period}
          existingReservations={cellReservations(modalInfo.date, modalInfo.period)}
          userReservation={userReservation(modalInfo.date, modalInfo.period)}
          blockInfo={getBlock(modalInfo.date, modalInfo.period)}
          role={role}
          onReserve={handleReserve}
          onDelete={handleDelete}
          onPatch={handlePatch}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onClose={() => setModalInfo(null)}
        />
      )}
    </div>
  )
}
