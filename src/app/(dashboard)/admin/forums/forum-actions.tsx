'use client'

type ForumActionsProps = {
  forumId: string
  currentStatus: string
  updateAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}

export function ForumStatusSelect({ forumId, currentStatus, updateAction }: Omit<ForumActionsProps, 'deleteAction'>) {
  return (
    <form action={updateAction}>
      <input type="hidden" name="id" value={forumId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={e => e.currentTarget.form?.requestSubmit()}
        style={{
          background: 'var(--bg-hover)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '6px 10px', fontSize: '12px', cursor: 'pointer',
        }}
      >
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="past">Past</option>
      </select>
    </form>
  )
}

export function ForumDeleteButton({ forumId, deleteAction }: { forumId: string, deleteAction: (formData: FormData) => Promise<void> }) {
  return (
    <form action={deleteAction}>
      <input type="hidden" name="id" value={forumId} />
      <button
        type="submit"
        onClick={e => { if (!confirm('Delete this forum?')) e.preventDefault() }}
        style={{
          padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
          border: '1px solid rgba(248,113,113,0.3)', background: 'transparent',
          color: 'var(--danger)', cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </form>
  )
}