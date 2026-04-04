import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: companiesCount },
    { count: projectsCount },
    { count: applicationsCount },
    { count: forumsCount },
    { data: recentApplications },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('forums').select('*', { count: 'exact', head: true }),
    supabase.from('applications')
      .select('id, status, created_at, profiles(full_name), projects(title)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Total Users',    value: usersCount ?? 0,       color: 'var(--accent)',   href: '/admin/users',        icon: '👤' },
    { label: 'Companies',      value: companiesCount ?? 0,   color: 'var(--warning)',  href: '/admin/companies',    icon: '🏢' },
    { label: 'Projects',       value: projectsCount ?? 0,    color: '#a78bfa',         href: '/admin/projects',     icon: '📁' },
    { label: 'Applications',   value: applicationsCount ?? 0,color: 'var(--success)',  href: '/admin/applications', icon: '📋' },
    { label: 'Forums',         value: forumsCount ?? 0,      color: '#fb923c',         href: '/admin/forums',       icon: '🎪' },
  ]

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Full platform overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-5">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}
            className="rounded-2xl p-5 border block transition-all"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', textDecoration: 'none' }}>
            <div className="text-xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Applications</h2>
          <Link href="/admin/applications" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentApplications?.map((app: any) => (
            <div key={app.id} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {app.profiles?.full_name ?? 'Unknown'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {app.projects?.title ?? 'Unknown project'}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{
                background: app.status === 'accepted' ? 'rgba(52,211,153,0.15)' :
                            app.status === 'rejected' ? 'rgba(248,113,113,0.15)' :
                            'rgba(251,191,36,0.15)',
                color: app.status === 'accepted' ? 'var(--success)' :
                       app.status === 'rejected' ? 'var(--danger)' :
                       'var(--warning)',
              }}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}