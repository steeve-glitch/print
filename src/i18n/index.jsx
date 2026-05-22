import { createContext, useContext, useState } from 'react'

const en = {
  // App
  loading: 'Loading...',
  appName: 'PrintFlow',

  // Login
  loginTitle: 'Print Request Management',
  loginSubtitle: 'Sign in to manage print requests',
  loginButton: 'Sign in with Google',

  // Account setup
  setupTitle: 'Account Setup',
  setupSubtitle: 'Tell us about yourself to get started.',
  nameLabel: 'Your Name',
  roleLabel: 'Your Role',
  selectRolePlaceholder: 'Select your role',
  roleTeacher: 'Teacher',
  roleHod: 'Head of Department',
  rolePrinter: 'Print Room Staff',
  completeSetup: 'Get Started',

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
  statusPrinting: 'Received',
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
  myRequestsTab: 'My Requests',
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
  startPrinting: 'Mark as Received',
  markReady: 'Mark as Ready for Pickup',
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
  tabDriveLink: 'Drive Link',
  tabUpload: 'Upload File',
  driveLinkLabel: 'Google Drive Link',
  driveLinkPlaceholder: 'https://docs.google.com/...',
  dropZoneText: 'Drag & drop a file here',
  dropZoneOr: 'or',
  dropZoneBrowse: 'browse to upload',
  dropZoneActive: 'Drop it!',
  fileSelected: 'Selected:',
  uploading: 'Uploading...',
  copiesLabel: 'Copies',
  sizeLabel: 'Paper Size',
  doubleSidedLabel: 'Double-Sided',
  neededByLabel: 'Needed By',
  departmentLabel: 'Department',
  selectDepartmentPlaceholder: 'Select department',
  notificationLabel: 'Email Notifications',
  notifyInstant: 'Instant',
  notifyNever: 'Never (Silent)',
  submitRequest: 'Submit Request',
  submitting: 'Submitting...',

  // Department activity
  deptActivityTitle: 'Department Activity',
  deptActivitySubtitle: 'Active requests from your colleagues — check before submitting duplicates.',
  noDeptActivity: 'No other active requests in your department.',

  // Reservations
  computersTab: 'Computers',
  printRequestsTab: 'Print Requests',
  reservationsTitle: 'Computer Reservations',
  reservationsSubtitle: 'Reserve PCs for your class. Click any period to book.',
  available: 'available',
  currentReservations: 'Current reservations',
  reservePcs: 'Make a reservation',
  pcCount: 'Number of PCs',
  maxAvailable: 'max',
  reservationNotesLabel: 'Notes (optional)',
  reservationNotesPlaceholder: 'e.g. Class IA, bring cables',
  confirmReservation: 'Confirm Reservation',
  cancelReservation: 'Cancel My Reservation',
  reservationSuccess: 'Reservation confirmed.',
  reservationError: 'Failed to reserve computers.',
  reservationFull: 'All PCs are reserved for this period.',
  reservationCancelled: 'Reservation cancelled.',
  today: 'Today',
  save: 'Save',
  blockPeriod: 'Block this period',
  unblockPeriod: 'Unblock period',
  blockedLabel: 'Blocked',
  blockReasonLabel: 'Reason (optional)',
  blockReasonPlaceholder: 'e.g. Room maintenance',
  periodBlockedMsg: 'This period is blocked. No new reservations allowed.',
  toastBlocked: 'Period blocked.',
  toastUnblocked: 'Period unblocked.',

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

  // Account setup
  setupTitle: 'Configuración de Cuenta',
  setupSubtitle: 'Cuéntanos sobre ti para comenzar.',
  nameLabel: 'Tu Nombre',
  roleLabel: 'Tu Rol',
  selectRolePlaceholder: 'Selecciona tu rol',
  roleTeacher: 'Profesor',
  roleHod: 'Jefe de Departamento',
  rolePrinter: 'Personal de Impresión',
  completeSetup: 'Comenzar',

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
  statusPrinting: 'Recibido',
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

  myRequestsTab: 'Mis Solicitudes',
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
  startPrinting: 'Marcar como Recibido',
  markReady: 'Marcar Listo para Recoger',
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
  tabDriveLink: 'Enlace Drive',
  tabUpload: 'Subir Archivo',
  driveLinkLabel: 'Enlace de Google Drive',
  driveLinkPlaceholder: 'https://docs.google.com/...',
  dropZoneText: 'Arrastra y suelta un archivo aquí',
  dropZoneOr: 'o',
  dropZoneBrowse: 'selecciona un archivo',
  dropZoneActive: '¡Suéltalo!',
  fileSelected: 'Seleccionado:',
  uploading: 'Subiendo...',
  copiesLabel: 'Copias',
  sizeLabel: 'Tamaño de Papel',
  doubleSidedLabel: 'Doble Cara',
  neededByLabel: 'Necesario Para',
  departmentLabel: 'Departamento',
  selectDepartmentPlaceholder: 'Seleccionar departamento',
  notificationLabel: 'Notificaciones por Correo',
  notifyInstant: 'Instantáneo',
  notifyNever: 'Nunca (Silencioso)',
  submitRequest: 'Enviar Solicitud',
  submitting: 'Enviando...',

  // Department activity
  deptActivityTitle: 'Actividad del Departamento',
  deptActivitySubtitle: 'Solicitudes activas de tus colegas — verifica antes de enviar duplicados.',
  noDeptActivity: 'No hay otras solicitudes activas en tu departamento.',

  // Reservations
  computersTab: 'Computadores',
  printRequestsTab: 'Solicitudes',
  reservationsTitle: 'Reservas de Computadores',
  reservationsSubtitle: 'Reserva PCs para tu clase. Haz clic en un período para reservar.',
  available: 'disponibles',
  currentReservations: 'Reservas actuales',
  reservePcs: 'Hacer una reserva',
  pcCount: 'Número de PCs',
  maxAvailable: 'máx',
  reservationNotesLabel: 'Notas (opcional)',
  reservationNotesPlaceholder: 'ej. Clase IA, traer cables',
  confirmReservation: 'Confirmar Reserva',
  cancelReservation: 'Cancelar Mi Reserva',
  reservationSuccess: 'Reserva confirmada.',
  reservationError: 'Error al reservar computadores.',
  reservationFull: 'Todos los PCs están reservados para este período.',
  reservationCancelled: 'Reserva cancelada.',
  today: 'Hoy',
  save: 'Guardar',
  blockPeriod: 'Bloquear este período',
  unblockPeriod: 'Desbloquear período',
  blockedLabel: 'Bloqueado',
  blockReasonLabel: 'Motivo (opcional)',
  blockReasonPlaceholder: 'ej. Mantenimiento de sala',
  periodBlockedMsg: 'Este período está bloqueado. No se permiten nuevas reservas.',
  toastBlocked: 'Período bloqueado.',
  toastUnblocked: 'Período desbloqueado.',

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
