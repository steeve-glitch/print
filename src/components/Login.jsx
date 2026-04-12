import { useState } from 'react'
import { Printer } from 'lucide-react'
import { useT } from '../i18n'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function Login({ onSignIn }) {
  const { t } = useT()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await onSignIn()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(t.toastError)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Printer className="text-blue-600" size={36} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.loginTitle}</h1>
        <p className="text-gray-500 text-sm mb-8">{t.loginSubtitle}</p>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-60 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all"
        >
          <GoogleIcon />
          {loading ? t.loading : t.loginButton}
        </button>
      </div>
    </div>
  )
}
