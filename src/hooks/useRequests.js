import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useStorage } from './useStorage'

export function useRequests(user) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { sendEmail } = useStorage()

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
    const docRef = await addDoc(collection(db, 'printRequests'), {
      documentName: data.documentName,
      googleDriveLink: data.googleDriveLink,
      copies: data.copies,
      color: data.color,
      size: data.size,
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

    // Notify HODs of the department
    try {
      const hodQuery = query(
        collection(db, 'users'), 
        where('department', '==', data.department),
        where('role', 'in', ['hod', 'admin'])
      )
      const hodSnapshot = await getDocs(hodQuery)
      hodSnapshot.forEach(doc => {
        const hod = doc.data()
        if (hod.email && hod.notificationFrequency !== 'never') {
          sendEmail(
            hod.email,
            `New Print Request: ${data.documentName}`,
            `<p>A new print request has been submitted for your department (${data.department}) by ${userName}.</p>
             <p><b>Document:</b> ${data.documentName}</p>
             <p>Please log in to the Print Manager to approve or reject it.</p>`
          )
        }
      })
    } catch (e) {
      console.error('Failed to send HOD notification', e)
    }
  }

  const updateRequest = async (id, updates, reqData) => {
    await updateDoc(doc(db, 'printRequests', id), updates)

    // Notify Teacher of status change
    if (updates.status && reqData?.requesterEmail) {
      const statusLabels = {
        approved: 'Approved',
        rejected: 'Rejected',
        printing: 'Printing',
        ready: 'Ready for Pickup',
        completed: 'Completed'
      }
      
      try {
        sendEmail(
          reqData.requesterEmail,
          `Print Request Update: ${statusLabels[updates.status] || updates.status}`,
          `<p>Your print request <b>${reqData.documentName}</b> has been updated to: <b>${statusLabels[updates.status] || updates.status}</b>.</p>
           ${updates.hodComment ? `<p><b>HOD Comment:</b> ${updates.hodComment}</p>` : ''}
           <p>Thank you for using Print Manager.</p>`
        )
      } catch (e) {
        console.error('Failed to send teacher notification', e)
      }
    }
  }

  const bulkUpdate = async (ids, updates) => {
    const promises = ids.map(id => updateDoc(doc(db, 'printRequests', id), updates))
    await Promise.all(promises)
  }

  return { requests, loading, createRequest, updateRequest, bulkUpdate }
}
