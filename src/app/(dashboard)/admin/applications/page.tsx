import { createClient } from '@/lib/supabase/server'
import ApplicationActions from './application-actions'

export default async function AdminApplicationsPage() {
  const supabase = await createClient()

  const { data: applications } = await supabase
    .from('applications')
    .select('*, profiles(full_name, email), projects(title, companies(company_name))')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          All Applications
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {applications?.length ?? 0} total applications
        </p>
      </div>

      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Student', 'Project', 'Company', 'Date', 'Actions'].map(h => (
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
            {applications?.map((app: any) => (
              <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {app.profiles?.full_name ?? '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {app.profiles?.email}
                  </p>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {app.projects?.title ?? '—'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {app.projects?.companies?.company_name ?? '—'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <ApplicationActions
                    applicationId={app.id}
                    currentStatus={app.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!applications?.length && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No applications found.
          </div>
        )}
      </div>
    </div>
  )
}