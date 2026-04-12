import { useState } from 'react'
import { CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react'
import { useT } from '../i18n'
import StatusBadge from './StatusBadge'

export default function RequestCard({ req, showActions, onApprove, onReject }) {
  const { t } = useT()
  const [rejecting, setRejecting] = useState(false)
  const [rejectComment, setRejectComment] = useState('')

  const handleReject = () => {
    if (!rejectComment.trim()) return
    onReject(req.id, rejectComment.trim())
    setRejecting(false)
    setRejectComment('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{req.documentName}</p>
          <p className="text-sm text-gray-500">
            {req.requesterName} · {req.department}
          </p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        <span>
          {req.copies} {t.copies}
        </span>
        <span>{req.color ? t.colorPrint : t.bwPrint}</span>
        <span>{req.doubleSided ? t.doubleSided : t.singleSided}</span>
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {req.neededBy}
        </span>
      </div>

      {req.googleDriveLink && (
        <a
          href={req.googleDriveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
        >
          <ExternalLink size={13} />
          {t.viewDocument}
        </a>
      )}

      {req.hodComment && (
        <p className="text-sm text-gray-500 italic">
          {t.hodComment} &ldquo;{req.hodComment}&rdquo;
        </p>
      )}

      {showActions && (
        <div>
          {rejecting ? (
            <div className="space-y-2">
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder={t.rejectReason}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={!rejectComment.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {t.confirmRejection}
                </button>
                <button
                  onClick={() => { setRejecting(false); setRejectComment('') }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(req.id)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                <CheckCircle size={15} />
                {t.approve}
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 rounded-lg border border-red-200 transition-colors"
              >
                <XCircle size={15} />
                {t.reject}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
