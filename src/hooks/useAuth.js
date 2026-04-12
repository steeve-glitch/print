import { useState, useEffect } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export function useAuth() {
  // undefined = loading, null = signed out, object = signed in
  const [user, setUser] = useState(undefined)
  const [role, setRole] = useState(null)
  const [userName, setUserName] = useState('')
  const [department, setDepartment] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data()
            setRole(data.role || null)
            setUserName(data.name || firebaseUser.displayName || '')
            setDepartment(data.department || null)
          } else {
            setRole(null)
            setUserName(firebaseUser.displayName || '')
            setDepartment(null)
          }
        } catch (err) {
          console.error('Error fetching user role:', err)
          setRole(null)
          setDepartment(null)
        }
      } else {
        setUser(null)
        setRole(null)
        setUserName('')
        setDepartment(null)
      }
    })
    return unsubscribe
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signOut = async () => {
    await fbSignOut(auth)
  }

  return {
    user,
    role,
    userName,
    department,
    loading: user === undefined,
    signIn,
    signOut,
  }
}
