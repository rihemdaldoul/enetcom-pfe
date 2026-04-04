'use client'

import { useTransition } from 'react'

type Props = {
  projectId: string
  currentStatus: string
  updateStatus: (formData: FormData) => Promise<void>
  deleteProject: (formData: FormData) => Promise<void>
}

export default function ProjectActions({ projectId, currentStatus, updateStatus, deleteProject }: Props) {
  const [pending, startTransition] = useTransition()

  function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const fd = new FormData()
    fd.append('id', projectId)
    fd.append('status', e.target.value)
    startTransition(() => updateStatus(fd))
  }

  function handleDelete() {
    if (!confirm('Delete this project?')) return
    const fd = new FormData()
    fd.append('id', projectId)
    startTransition(() => deleteProject(fd))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <select value={currentStatus} onChange={handleStatus} disabled={pending}
        style={{
          background: 'var(--bg-hover)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '6px 10px', fontSize: '12px', cursor: 'pointer',
          opacity: pending ? 0.5 : 1,
        }}>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="filled">Filled</option>
      </select>
      <button onClick={handleDelete} disabled={pending} style={{
        padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
        border: '1px solid rgba(248,113,113,0.3)', background: 'transparent',
        color: 'var(--danger)', cursor: 'pointer', opacity: pending ? 0.5 : 1,
      }}>
        Delete
      </button>
    </div>
  )
}