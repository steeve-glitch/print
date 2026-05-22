import { useState, useCallback } from 'react'

const WORKER_URL = import.meta.env.VITE_WORKER_URL
const AUTH_TOKEN = import.meta.env.VITE_WORKER_AUTH_TOKEN

export function useReservations(user, role) {
  const [reservations, setReservations] = useState([])
  const [blockedPeriods, setBlockedPeriods] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReservations = useCallback(async (from, to) => {
    if (!user?.uid) return
    try {
      const [resRes, blockRes] = await Promise.all([
        fetch(`${WORKER_URL}/api/reservations?from=${from}&to=${to}`, {
          headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
        }),
        fetch(`${WORKER_URL}/api/blocked-periods?from=${from}&to=${to}`, {
          headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
        }),
      ])
      if (!resRes.ok || !blockRes.ok) throw new Error('Fetch failed')
      const [resData, blockData] = await Promise.all([resRes.json(), blockRes.json()])
      const nextRes = Array.isArray(resData) ? resData : []
      const nextBlocked = Array.isArray(blockData) ? blockData : []
      setReservations(prev => {
        const nextStr = JSON.stringify(nextRes)
        return JSON.stringify(prev) === nextStr ? prev : nextRes
      })
      setBlockedPeriods(prev => {
        const nextStr = JSON.stringify(nextBlocked)
        return JSON.stringify(prev) === nextStr ? prev : nextBlocked
      })
    } catch (err) {
      console.error('Error fetching reservation data:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  const createReservation = async ({ date, period, pcCount, teacherName, department, notes }) => {
    const response = await fetch(`${WORKER_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, period, pcCount, teacherId: user.uid, teacherName, department, notes: notes || '' }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to reserve')
    }
    return response.json()
  }

  const deleteReservation = async (id) => {
    const response = await fetch(`${WORKER_URL}/api/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'X-User-Role': role,
        'X-User-Id': user.uid,
      },
    })
    if (!response.ok) throw new Error('Failed to delete')
  }

  const patchReservation = async (id, updates) => {
    const response = await fetch(`${WORKER_URL}/api/reservations/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-Role': role,
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to update')
    }
  }

  const blockPeriod = async ({ date, period, reason }) => {
    const response = await fetch(`${WORKER_URL}/api/blocked-periods`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-Role': role,
      },
      body: JSON.stringify({ date, period, reason: reason || '' }),
    })
    if (!response.ok) throw new Error('Failed to block period')
    return response.json()
  }

  const unblockPeriod = async (id) => {
    const response = await fetch(`${WORKER_URL}/api/blocked-periods/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'X-User-Role': role,
      },
    })
    if (!response.ok) throw new Error('Failed to unblock period')
  }

  return {
    reservations, blockedPeriods, loading,
    fetchReservations,
    createReservation, deleteReservation, patchReservation,
    blockPeriod, unblockPeriod,
  }
}
