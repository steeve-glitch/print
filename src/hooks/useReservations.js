import { useState, useCallback } from 'react'

const WORKER_URL = import.meta.env.VITE_WORKER_URL
const AUTH_TOKEN = import.meta.env.VITE_WORKER_AUTH_TOKEN

export function useReservations(user, role) {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReservations = useCallback(async (from, to) => {
    if (!user?.uid) return
    try {
      const response = await fetch(`${WORKER_URL}/api/reservations?from=${from}&to=${to}`, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
      })
      const data = await response.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching reservations:', err)
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

  return { reservations, loading, fetchReservations, createReservation, deleteReservation, patchReservation }
}
