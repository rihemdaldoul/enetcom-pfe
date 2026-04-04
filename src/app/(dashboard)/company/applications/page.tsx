'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Application = {
  id: string
  status: string
  cover_letter: string
  cv_url: string | null
  created_at: string
  student_id: string
  project_id: string
  profiles: { full_name: string; email: string } | null
  projects: { title: string } | null
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'rgba(217,119,6,0.08)',  color: '#d97706', border: 'rgba(217,119,6,0.3)'  },
  reviewing: { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  accepted:  { bg: 'rgba(22,163,74,0.08)',  color: '#16a34a', border: 'rgba(22,163,74,0.3)'  },
  rejected:  { bg: 'rgba(220,38,38,0.08)',  color: '#dc2626', border: 'rgba(220,38,38,0.3)'  },
}

export default function CompanyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading]           = useState(true)
  const [updating, setUpdating]         = useState<string | null>(null)
  const [filter, setFilter]             = useState('all')
  const [expanded, setExpanded]         = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!company) { setLoading(false); return }

    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('company_id', company.id)

    const projectIds = (projects ?? []).map(p => p.id)
    if (projectIds.length === 0) { setLoading(false); return }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        id, status, cover_letter, cv_url, created_at, student_id, project_id,
        profiles ( full_name, email ),
        projects ( title )
      `)
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    setApplications((data as any) ?? [])
    setLoading(false)
  }

  async function updateStatus(appId: string, newStatus: 'accepted' | 'rejected') {
    setUpdating(appId)
    const supabase = createClient()
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', appId)

    if (!error) {
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      )
    }
    setUpdating(null)
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter)

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading applications...</p>
    </div>
  )

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
        Applications
      </h1>
      <p style={{ marginTop: '4px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Review and manage student applications.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '24px' }}>
        {[
          { key: 'all',      label: 'Total',    color: 'var(--text-primary)' },
          { key: 'pending',  label: 'Pending',  color: 'var(--warning)'      },
          { key: 'accepted', label: 'Accepted', color: 'var(--success)'      },
          { key: 'rejected', label: 'Rejected', color: 'var(--danger)'       },
        ].map(s => (
          <div key={s.key} style={{
            borderRadius: '12px', border: '1px solid var(--border)',
            background: 'var(--bg-card)', padding: '16px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, marginTop: '4px' }}>
              {counts[s.key as keyof typeof counts]}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
              border: filter === f ? 'none' : '1px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text-secondary)',
            }}
          >
            {f} ({f === 'all' ? counts.all : counts[f as keyof typeof counts]})
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{
            borderRadius: '12px', border: '1px solid var(--border)',
            background: 'var(--bg-card)', padding: '40px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: '14px',
          }}>
            No {filter === 'all' ? '' : filter} applications yet.
          </div>
        ) : filtered.map(app => {
          const sc = statusColors[app.status] ?? statusColors.pending
          const isExpanded = expanded === app.id

          return (
            <div key={app.id} style={{
              borderRadius: '16px', border: '1px solid var(--border)',
              background: 'var(--bg-card)', overflow: 'hidden',
            }}>
              {/* Header row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '16px 20px', gap: '16px',
              }}>
                {/* Student info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Avatar circle */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--accent)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {(app.profiles?.full_name ?? 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {app.profiles?.full_name ?? 'Unknown Student'}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        ✉ {app.profiles?.email}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
                      background: sc.bg, color: sc.color,
                      border: `1px solid ${sc.border}`, fontWeight: 600,
                    }}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📁 <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {app.projects?.title}
                      </span>
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📅 {new Date(app.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {/* CV Button */}
                  {app.cv_url ? (
                    <a
                      href={app.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                        fontWeight: 600, textDecoration: 'none',
                        border: '1px solid rgba(59,130,246,0.3)',
                        background: 'rgba(59,130,246,0.06)', color: 'var(--accent)',
                      }}
                    >
                      📄 View CV
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No CV</span>
                  )}

                  {/* Expand/Collapse cover letter */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : app.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? 'Hide letter ▲' : 'Cover letter ▼'}
                  </button>

                  {/* Accept / Reject */}
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(app.id, 'accepted')}
                        disabled={updating === app.id}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                          fontWeight: 600, border: '1px solid rgba(22,163,74,0.3)',
                          background: 'rgba(22,163,74,0.08)', color: 'var(--success)',
                          cursor: 'pointer', opacity: updating === app.id ? 0.5 : 1,
                        }}
                      >
                        {updating === app.id ? '...' : '✓ Accept'}
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'rejected')}
                        disabled={updating === app.id}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                          fontWeight: 600, border: '1px solid rgba(220,38,38,0.3)',
                          background: 'rgba(220,38,38,0.08)', color: 'var(--danger)',
                          cursor: 'pointer', opacity: updating === app.id ? 0.5 : 1,
                        }}
                      >
                        {updating === app.id ? '...' : '✕ Reject'}
                      </button>
                    </>
                  )}

                  {/* Undo for accepted/rejected */}
                  {(app.status === 'accepted' || app.status === 'rejected') && (
                    <button
                      onClick={() => updateStatus(app.id, app.status === 'accepted' ? 'rejected' : 'accepted')}
                      disabled={updating === app.id}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        opacity: updating === app.id ? 0.5 : 1,
                      }}
                    >
                      {app.status === 'accepted' ? '✕ Reject instead' : '✓ Accept instead'}
                    </button>
                  )}
                </div>
              </div>

              {/* Cover letter expandable */}
              {isExpanded && app.cover_letter && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '16px 20px',
                  background: 'var(--bg-secondary)',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    COVER LETTER
                  </p>
                  <p style={{
                    fontSize: '14px', color: 'var(--text-primary)',
                    lineHeight: 1.7, whiteSpace: 'pre-line',
                  }}>
                    {app.cover_letter}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}