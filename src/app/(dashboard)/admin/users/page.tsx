import { createClient } from '@/lib/supabase/server'
import UserActions from './user-actions'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Users</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {users?.length ?? 0} registered users
        </p>
      </div>

      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Role', 'CV', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>

                {/* Name */}
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                    {user.full_name ?? '—'}
                  </p>
                </td>

                {/* Email */}
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {user.email}
                </td>

                {/* Role */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '999px',
                    background: user.role === 'admin'
                      ? 'rgba(139,92,246,0.15)'
                      : user.role === 'company'
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(16,185,129,0.15)',
                    color: user.role === 'admin'
                      ? '#7c3aed'
                      : user.role === 'company'
                      ? 'var(--accent)'
                      : 'var(--success)',
                  }}>
                    {user.role}
                  </span>
                </td>

                {/* CV */}
                <td style={{ padding: '12px 16px' }}>
                  {user.role === 'student' ? (
                    user.cv_url ? (
                      <a
                        href={user.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                      >
                        📄 View CV
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No CV</span>
                    )
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                  )}
                </td>

                {/* Joined */}
                <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                {/* Status */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '999px',
                    background: user.is_banned ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
                    color: user.is_banned ? 'var(--danger)' : 'var(--success)',
                  }}>
                    {user.is_banned ? 'Banned' : 'Active'}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: '12px 16px' }}>
                  <UserActions
                    userId={user.id}
                    currentRole={user.role}
                    isBanned={user.is_banned ?? false}
                  />
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}