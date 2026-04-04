'use client'

import { toggleVerify, deleteCompany } from './actions'

export function CompanyActions({ companyId, isVerified }: {
  companyId: string
  isVerified: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <form action={toggleVerify}>
        <input type="hidden" name="id" value={companyId} />
        <input type="hidden" name="verified" value={String(isVerified)} />
        <button type="submit" style={{
          padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
          border: `1px solid ${isVerified ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
          background: 'transparent',
          color: isVerified ? 'var(--warning)' : 'var(--success)',
          cursor: 'pointer',
        }}>
          {isVerified ? 'Unverify' : 'Verify'}
        </button>
      </form>

      <form action={deleteCompany}>
        <input type="hidden" name="id" value={companyId} />
        <button
          type="submit"
          onClick={e => { if (!confirm('Delete this company and all its projects?')) e.preventDefault() }}
          style={{
            padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
            border: '1px solid rgba(248,113,113,0.3)', background: 'transparent',
            color: 'var(--danger)', cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </form>
    </div>
  )
}