import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

const WORKER_URL = import.meta.env.VITE_WORKER_URL
const AUTH_TOKEN = import.meta.env.VITE_WORKER_AUTH_TOKEN

/**
 * Uploads a file to Cloudflare R2 via a Worker proxy.
 */
export async function uploadToR2(file) {
  if (!WORKER_URL) throw new Error('Worker URL not configured')
  
  const uploadUrl = `${WORKER_URL}/upload/${encodeURIComponent(file.name)}`

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!response.ok) throw new Error(`Failed to upload to R2: ${await response.text()}`)
  
  return `${WORKER_URL}/download/${encodeURIComponent(file.name)}`
}

/**
 * Deletes a file from Cloudflare R2 given its URL.
 * Firebase Storage is disabled on Spark plan, so we ignore those URLs.
 */
export async function deleteFileByUrl(url) {
  if (!url) return

  // Handle Cloudflare R2
  if (WORKER_URL && url.startsWith(WORKER_URL)) {
    try {
      const filename = url.split('/download/')[1]
      if (!filename) return

      await fetch(`${WORKER_URL}/delete/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      })
    } catch (error) {
      console.error('Error deleting file from R2:', error)
    }
  }
  
  // Firebase Storage URLs are ignored because the service is disabled (402 Error)
}
