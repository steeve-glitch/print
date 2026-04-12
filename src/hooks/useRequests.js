import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useRequests(user) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setRequests([])
      setLoading(false)
      return
    }

    const q = query(collection(db, 'printRequests'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Firestore error:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user?.uid])

  const createRequest = async (data, user, userName) => {
    await addDoc(collection(db, 'printRequests'), {
      documentName: data.documentName,
      googleDriveLink: data.googleDriveLink,
      copies: data.copies,
      color: data.color,
      doubleSided: data.doubleSided,
      neededBy: data.neededBy,
      department: data.department,
      requesterId: user.uid,
      requesterName: userName || user.displayName || '',
      requesterEmail: user.email || '',
      status: 'pending_hod',
      createdAt: serverTimestamp(),
      hodComment: '',
      printerNotes: '',
    })
  }

  const updateRequest = async (id, updates) => {
    await updateDoc(doc(db, 'printRequests', id), updates)
  }

  return { requests, loading, createRequest, updateRequest }
}
