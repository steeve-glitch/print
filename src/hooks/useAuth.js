import { useState, useEffect } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../firebase'

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const AUTH_TOKEN = import.meta.env.VITE_WORKER_AUTH_TOKEN;

export function useAuth() {
  const [user, setUser] = useState(undefined)
  const [role, setRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')
  const [department, setDepartment] = useState(null)
  const [notificationFrequency, setNotificationFrequency] = useState('instant')
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          // Sync with Cloudflare D1
          const response = await fetch(`${WORKER_URL}/api/users/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
            }),
          });

          const data = await response.json();
          const isHardcodedAdmin = firebaseUser.email === 'sbell@stjohns.cl';
          
          if (data && data.role) {
            const adminStatus = isHardcodedAdmin || data.role === 'admin';
            setIsAdmin(adminStatus);
            setRole(adminStatus ? 'admin' : data.role);
            setUserName(data.name || firebaseUser.displayName || '');
            setDepartment(data.department || null);
            setNotificationFrequency(data.notificationFrequency || 'instant');
            setNeedsSetup(false);
          } else {
            setIsAdmin(isHardcodedAdmin);
            setRole(isHardcodedAdmin ? 'admin' : null);
            setUserName(firebaseUser.displayName || '');
            setNeedsSetup(!isHardcodedAdmin);
          }
        } catch (err) {
          console.error('Error syncing user:', err);
        }
      } else {
        setUser(null)
        setRole(null)
        setIsAdmin(false)
        setUserName('')
        setDepartment(null)
        setNeedsSetup(false)
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

  const setupAccount = async ({ name, role: newRole, department: newDept, notificationFrequency: newFreq }) => {
    await fetch(`${WORKER_URL}/api/users/setup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.uid,
        name,
        role: newRole,
        department: newDept,
        notificationFrequency: newFreq,
      }),
    });

    setRole(newRole);
    setUserName(name);
    setDepartment(newDept);
    setNotificationFrequency(newFreq);
    setNeedsSetup(false);
  }

  return {
    user,
    role,
    isAdmin,
    setRole,
    userName,
    department,
    notificationFrequency,
    needsSetup,
    loading: user === undefined,
    signIn,
    signOut,
    setupAccount,
  }
}
