import { Printer } from 'lucide-react'
import { LangProvider, useT } from './i18n'
import { ToastProvider } from './components/Toast'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import NoAccess from './components/NoAccess'
import Header from './components/Header'
import TeacherDashboard from './dashboards/TeacherDashboard'
import HODDashboard from './dashboards/HODDashboard'
import PrinterDashboard from './dashboards/PrinterDashboard'

const DASHBOARDS = {
  teacher: TeacherDashboard,
  hod: HODDashboard,
  printer: PrinterDashboard,
  admin: HODDashboard,
}

function AppContent() {
  const { user, role, userName, department, loading, signIn, signOut } = useAuth()
  const { t } = useT()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Printer className="text-blue-400 animate-pulse" size={40} />
        <p className="text-gray-400 text-sm">{t.loading}</p>
      </div>
    )
  }

  if (!user) {
    return <Login onSignIn={signIn} />
  }

  if (!role) {
    return <NoAccess user={user} onSignOut={signOut} />
  }

  const Dashboard = DASHBOARDS[role]

  if (!Dashboard) {
    return <NoAccess user={user} onSignOut={signOut} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} role={role} userName={userName} onSignOut={signOut} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Dashboard user={user} userName={userName} role={role} department={department} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LangProvider>
  )
}
