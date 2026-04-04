'use client'

import { useTransition } from 'react'
import { updateStatus, deleteApplication } from './actions'

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(251,191,36,0.15)',  color: 'var(--warning)' },
  reviewing: { bg: 'rgba(91,110,245,0.15)',  color: 'var(--accent)'  },
  accepted:  { bg: 'rgba(52,211,153,0.15)',  color: 'var(--success)' },
  rejected:  { bg: 'rgba(248,113,113,0.15)', color: 'var(--danger)'  },
}

type Props = {
  applicationId: string
  currentStatus: string
}

export default function ApplicationActions({ applicationId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const fd = new FormData()
    fd.append('id', applicationId)
    fd.append('status', e.target.value)
    startTransition(() => updateStatus(fd))
  }

  function handleDelete() {
    if (!confirm('Delete this application?')) return
    const fd = new FormData()
    fd.append('id', applicationId)
    startTransition(() => deleteApplication(fd))
  }

  const sc = statusColors[currentStatus] ?? statusColors.pending

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={pending}
        style={{
          background: sc.bg, color: sc.color,
          border: `1px solid ${sc.color}40`,
          borderRadius: '6px', padding: '4px 8px',
          fontSize: '12px', cursor: 'pointer',
          opacity: pending ? 0.5 : 1,
        }}
      >
        <option value="pending">pending</option>
        <option value="reviewing">reviewing</option>
        <option value="accepted">accepted</option>
        <option value="rejected">rejected</option>
      </select>

      <button
        onClick={handleDelete}
        disabled={pending}
        style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
          border: '1px solid rgba(248,113,113,0.3)', background: 'transparent',
          color: 'var(--danger)', cursor: 'pointer',
          opacity: pending ? 0.5 : 1,
        }}
      >
        Delete
      </button>
    </div>
  )
}