import { createContext, useContext, useState } from 'react'

const en = {
  // App
  loading: 'Loading...',
  appName: 'PrintFlow',

  // Login
  loginTitle: 'Print Request Management',
  loginSubtitle: 'Sign in to manage print requests',
  loginButton: 'Sign in with Google',

  // NoAccess
  noAccessTitle: 'Waiting for Access',
  noAccessMessage: "Your account exists but hasn't been assigned a role yet. Please contact your administrator.",
  noAccessEmail: 'Your email:',
  signOut: 'Sign Out',

  // Header role badges
  roleBadgeTeacher: 'Teacher',
  roleBadgeHod: 'Head of Department',
  roleBadgePrinter: 'Print Room',
  roleBadgeAdmin: 'Admin',

  // Status labels
  statusPendingHod: 'Pending HOD',
  statusApproved: 'Approved',
  statusRejected: 'Rejected',
  statusPrinting: 'Printing',
  statusReady: 'Ready for Pickup',
  statusCollected: 'Collected',

  // Teacher dashboard
  teacherTitle: 'My Print Requests',
  teacherSubtitle: 'Track the status of your documents.',
  newRequest: 'New Request',
  readyForPickup: 'Ready for Pickup',
  markCollected: 'Mark Collected',
  noRequests: 'No print requests yet. Submit one to get started.',
  docName: 'Document',
  copies: 'Copies',
  neededBy: 'Needed By',
  status: 'Status',
  actions: 'Actions',
  department: 'Department',

  // HOD dashboard
  hodTitle: 'Approval Queue',
  hodSubtitle: 'Review pending print requests.',
  pendingTab: 'Pending',
  historyTab: 'History',
  requester: 'Requester',
  approve: 'Approve',
  reject: 'Reject',
  rejectReason: 'Reason for rejection (required)',
  confirmRejection: 'Confirm Rejection',
  cancel: 'Cancel',
  noPending: 'No pending requests.',
  noHistory: 'No history yet.',
  viewDocument: 'View Document',
  hodComment: 'HOD note:',

  // Printer dashboard
  printerTitle: 'Print Queue',
  printerSubtitle: 'Approved requests waiting to be printed.',
  startPrinting: 'Start Printing',
  markReady: 'Mark Ready',
  noQueue: 'No requests in the queue.',
  colorPrint: 'Color',
  bwPrint: 'B&W',
  doubleSided: 'Double-sided',
  singleSided: 'Single-sided',
  overdue: 'Overdue',
  dueToday: 'Due Today',

  // New request modal
  modalTitle: 'New Print Request',
  docNameLabel: 'Document Name',
  docNamePlaceholder: 'e.g. Math Test Unit 5',
  driveLinkLabel: 'Google Drive Link',
  driveLinkPlaceholder: 'https://docs.google.com/...',
  copiesLabel: 'Copies',
  colorLabel: 'Print Type',
  doubleSidedLabel: 'Double-Sided',
  colorOption: 'Color',
  bwOption: 'Black & White',
  neededByLabel: 'Needed By',
  departmentLabel: 'Department',
  selectDepartmentPlaceholder: 'Select department',
  submitRequest: 'Submit Request',
  submitting: 'Submitting...',

  // Toast messages
  toastSubmitted: 'Request submitted for HOD approval.',
  toastApproved: 'Request approved.',
  toastRejected: 'Request rejected.',
  toastPrinting: 'Printing started.',
  toastReady: 'Marked as ready for pickup.',
  toastCollected: 'Marked as collected.',
  toastError: 'Something went wrong. Please try again.',
  toastUpdateError: 'Failed to update status.',
}

const es = {
  loading: 'Cargando...',
  appName: 'PrintFlow',

  loginTitle: 'Gestión de Solicitudes de Impresión',
  loginSubtitle: 'Inicia sesión para gestionar solicitudes de impresión',
  loginButton: 'Iniciar sesión con Google',

  noAccessTitle: 'Esperando Acceso',
  noAccessMessage: 'Tu cuenta existe pero aún no se le ha asignado un rol. Por favor, contacta a tu administrador.',
  noAccessEmail: 'Tu correo:',
  signOut: 'Cerrar Sesión',

  roleBadgeTeacher: 'Profesor',
  roleBadgeHod: 'Jefe de Departamento',
  roleBadgePrinter: 'Sala de Impresión',
  roleBadgeAdmin: 'Administrador',

  statusPendingHod: 'Pendiente JD',
  statusApproved: 'Aprobado',
  statusRejected: 'Rechazado',
  statusPrinting: 'Imprimiendo',
  statusReady: 'Listo para Recoger',
  statusCollected: 'Recogido',

  teacherTitle: 'Mis Solicitudes de Impresión',
  teacherSubtitle: 'Rastrea el estado de tus documentos.',
  newRequest: 'Nueva Solicitud',
  readyForPickup: 'Listo para Recoger',
  markCollected: 'Marcar Recogido',
  noRequests: 'Aún no hay solicitudes. Envía una para empezar.',
  docName: 'Documento',
  copies: 'Copias',
  neededBy: 'Necesario Para',
  status: 'Estado',
  actions: 'Acciones',
  department: 'Departamento',

  hodTitle: 'Cola de Aprobación',
  hodSubtitle: 'Revisa las solicitudes de impresión pendientes.',
  pendingTab: 'Pendientes',
  historyTab: 'Historial',
  requester: 'Solicitante',
  approve: 'Aprobar',
  reject: 'Rechazar',
  rejectReason: 'Motivo del rechazo (obligatorio)',
  confirmRejection: 'Confirmar Rechazo',
  cancel: 'Cancelar',
  noPending: 'No hay solicitudes pendientes.',
  noHistory: 'No hay historial todavía.',
  viewDocument: 'Ver Documento',
  hodComment: 'Nota del JD:',

  printerTitle: 'Cola de Impresión',
  printerSubtitle: 'Solicitudes aprobadas esperando impresión.',
  startPrinting: 'Iniciar Impresión',
  markReady: 'Marcar Listo',
  noQueue: 'No hay solicitudes en la cola.',
  colorPrint: 'Color',
  bwPrint: 'B/N',
  doubleSided: 'Doble cara',
  singleSided: 'Una cara',
  overdue: 'Atrasado',
  dueToday: 'Hoy',

  modalTitle: 'Nueva Solicitud de Impresión',
  docNameLabel: 'Nombre del Documento',
  docNamePlaceholder: 'ej. Examen de Matemáticas Unidad 5',
  driveLinkLabel: 'Enlace de Google Drive',
  driveLinkPlaceholder: 'https://docs.google.com/...',
  copiesLabel: 'Copias',
  colorLabel: 'Tipo de Impresión',
  doubleSidedLabel: 'Doble Cara',
  colorOption: 'Color',
  bwOption: 'Blanco y Negro',
  neededByLabel: 'Necesario Para',
  departmentLabel: 'Departamento',
  selectDepartmentPlaceholder: 'Seleccionar departamento',
  submitRequest: 'Enviar Solicitud',
  submitting: 'Enviando...',

  toastSubmitted: 'Solicitud enviada para aprobación del JD.',
  toastApproved: 'Solicitud aprobada.',
  toastRejected: 'Solicitud rechazada.',
  toastPrinting: 'Impresión iniciada.',
  toastReady: 'Marcado como listo para recoger.',
  toastCollected: 'Marcado como recogido.',
  toastError: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  toastUpdateError: 'Error al actualizar el estado.',
}

const translations = { en, es }

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const toggleLang = () => {
    const next = lang === 'en' ? 'es' : 'en'
    localStorage.setItem('lang', next)
    setLang(next)
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT must be used within LangProvider')
  return ctx
}
