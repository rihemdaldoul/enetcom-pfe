import { createAdminClient } from '@/lib/supabase/admin'
import { updateParticipation } from './actions'

export default async function AdminForumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: forum } = await supabase
    .from('forums')
    .select('*')
    .eq('id', id)
    .single()

  const { data: participations, error } = await supabase
    .from('forum_participations')
    .select('*, profiles(full_name, email, role)')
    .eq('forum_id', id)
    .order('created_at', { ascending: false })

  console.log('participations:', participations, 'error:', error)

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Forum Header */}
      <div className="rounded-2xl border p-6 mb-8"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {forum?.title}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          📍 {forum?.location} &nbsp;·&nbsp;
          📅 {forum && new Date(forum.event_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
        {forum?.description && (
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {forum.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Participation Requests ({participations?.length ?? 0})
        </h2>
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
          <span style={{ color: 'var(--warning)' }}>
            ⏳ {participations?.filter(p => p.status === 'pending').length ?? 0} pending
          </span>
          <span style={{ color: 'var(--success)' }}>
            ✓ {participations?.filter(p => p.status === 'accepted').length ?? 0} accepted
          </span>
          <span style={{ color: 'var(--danger)' }}>
            ✗ {participations?.filter(p => p.status === 'rejected').length ?? 0} rejected
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Type', 'Message', 'Offer', 'Status', 'Action'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participations?.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {p.profiles?.full_name ?? '—'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {p.profiles?.email}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                    background: p.profiles?.role === 'student' ? 'rgba(91,110,245,0.15)' : 'rgba(167,139,250,0.15)',
                    color: p.profiles?.role === 'student' ? 'var(--accent)' : '#a78bfa',
                  }}>
                    {p.profiles?.role === 'student' ? '🎓 Student' : '🏢 Company'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                  {p.message ?? '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.offer_url ? (
                    <a href={p.offer_url} target="_blank" rel="noreferrer"
                      style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>
                      View offer
                    </a>
                  ) : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '999px',
                    background: p.status === 'accepted' ? 'rgba(52,211,153,0.15)' :
                                p.status === 'rejected' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                    color: p.status === 'accepted' ? 'var(--success)' :
                           p.status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <form action={updateParticipation} style={{ display: 'flex', gap: '6px' }}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="forum_id" value={id} />
                    {p.status !== 'accepted' && (
                      <button name="status" value="accepted" type="submit" style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                        border: '1px solid rgba(52,211,153,0.3)', background: 'transparent',
                        color: 'var(--success)', cursor: 'pointer',
                      }}>Accept</button>
                    )}
                    {p.status !== 'rejected' && (
                      <button name="status" value="rejected" type="submit" style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                        border: '1px solid rgba(248,113,113,0.3)', background: 'transparent',
                        color: 'var(--danger)', cursor: 'pointer',
                      }}>Reject</button>
                    )}
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!participations?.length && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No participation requests yet.
          </div>
        )}
      </div>
    </div>
  )
}