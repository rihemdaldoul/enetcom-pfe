'use client'

import { useTransition } from 'react'
import { banUser, deleteUser, changeRole } from './actions'

type Props = {
  userId: string
  currentRole: string
  isBanned: boolean
}

export default function UserActions({ userId, currentRole, isBanned }: Props) {
  const [pending, startTransition] = useTransition()

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const fd = new FormData()
    fd.append('id', userId)
    fd.append('role', e.target.value)
    startTransition(() => changeRole(fd))
  }

  function handleBan() {
    const fd = new FormData()
    fd.append('id', userId)
    fd.append('banned', String(isBanned))
    startTransition(() => banUser(fd))
  }

  function handleDelete() {
    if (!confirm('Delete this user permanently?')) return
    const fd = new FormData()
    fd.append('id', userId)
    startTransition(() => deleteUser(fd))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={pending}
        style={{
          background: 'var(--bg-hover)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '6px',
          padding: '4px 8px', fontSize: '12px', cursor: 'pointer',
        }}
      >
        <option value="student">🎓 student</option>
        <option value="company">🏢 company</option>
        <option value="admin">⚙️ admin</option>
      </select>

      <button onClick={handleBan} disabled={pending} style={{
        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
        border: '1px solid var(--border)', background: 'transparent',
        color: isBanned ? 'var(--success)' : 'var(--warning)',
        cursor: 'pointer', opacity: pending ? 0.5 : 1,
      }}>
        {isBanned ? 'Unban' : 'Ban'}
      </button>

      <button onClick={handleDelete} disabled={pending} style={{
        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
        border: '1px solid rgba(248,113,113,0.3)', background: 'transparent',
        color: 'var(--danger)', cursor: 'pointer', opacity: pending ? 0.5 : 1,
      }}>
        Delete
      </button>
    </div>
  )
}