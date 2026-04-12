import { useT } from '../i18n'

const statusConfig = {
  pending_hod: {
    key: 'statusPendingHod',
    style: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  approved: {
    key: 'statusApproved',
    style: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  rejected: {
    key: 'statusRejected',
    style: 'bg-red-100 text-red-800 border-red-200',
  },
  printing: {
    key: 'statusPrinting',
    style: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  ready: {
    key: 'statusReady',
    style: 'bg-green-100 text-green-800 border-green-200',
  },
  collected: {
    key: 'statusCollected',
    style: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

export default function StatusBadge({ status }) {
  const { t } = useT()
  const config = statusConfig[status] || {
    key: null,
    style: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${config.style}`}
    >
      {config.key ? t[config.key] : status}
    </span>
  )
}
