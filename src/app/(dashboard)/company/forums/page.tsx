'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Forum, ForumParticipation } from '@/types'

export default function CompanyForumsPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [participations, setParticipations] = useState<ForumParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [offerUrl, setOfferUrl] = useState('')
  const [participating, setParticipating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const [{ data: forumsData }, { data: partData }] = await Promise.all([
        supabase.from('forums').select('*').order('event_date', { ascending: true }),
        supabase.from('forum_participations').select('*').eq('profile_id', user!.id),
      ])

      setForums(forumsData ?? [])
      setParticipations(partData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleParticipate(forumId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('forum_participations').insert({
      forum_id:   forumId,
      profile_id: user!.id,
      role:       'company',
      message,
      offer_url:  offerUrl || null,
      status:     'pending',
    })

    if (!error) {
      const { data } = await supabase
        .from('forum_participations').select('*').eq('profile_id', user!.id)
      setParticipations(data ?? [])
      setParticipating(null)
      setMessage('')
      setOfferUrl('')
    }
  }

  if (loading) return (
    <div className="p-8" style={{ color: 'var(--text-muted)' }}>Loading...</div>
  )

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Forums</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Register your company for upcoming recruitment forums
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {forums.map(forum => {
          const participation = participations.find(p => p.forum_id === forum.id)
          const isPast = forum.status === 'past'

          return (
            <div key={forum.id} className="rounded-2xl border p-6"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                      background: forum.status === 'upcoming' ? 'rgba(91,110,245,0.15)' :
                                  forum.status === 'ongoing' ? 'rgba(52,211,153,0.15)' : 'rgba(156,163,175,0.15)',
                      color: forum.status === 'upcoming' ? 'var(--accent)' :
                             forum.status === 'ongoing' ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      {forum.status === 'upcoming' ? '🔔 Upcoming' :
                       forum.status === 'ongoing' ? '🟢 Ongoing' : '✓ Past'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                    {forum.title}
                  </h3>
                  {forum.description && (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {forum.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>📍 {forum.location}</span>
                    <span>📅 {new Date(forum.event_date).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</span>
                    {forum.deadline && (
                      <span>⏰ Register by {new Date(forum.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div style={{ minWidth: '140px', textAlign: 'right' }}>
                  {participation ? (
                    <div>
                      <span style={{
                        display: 'inline-block', fontSize: '12px', padding: '6px 14px',
                        borderRadius: '8px', fontWeight: 500,
                        background: participation.status === 'accepted' ? 'rgba(52,211,153,0.15)' :
                                    participation.status === 'rejected' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                        color: participation.status === 'accepted' ? 'var(--success)' :
                               participation.status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                      }}>
                        {participation.status === 'accepted' ? '✓ Accepted' :
                         participation.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {participation.status === 'pending' && 'Awaiting admin review'}
                        {participation.status === 'accepted' && 'Your company is confirmed!'}
                        {participation.status === 'rejected' && 'Not selected this time'}
                      </p>
                    </div>
                  ) : isPast ? (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Event ended</span>
                  ) : (
                    <button
                      onClick={() => setParticipating(participating === forum.id ? null : forum.id)}
                      style={{
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
                      }}>
                      Participate
                    </button>
                  )}
                </div>
              </div>

              {/* Company Participate Form — includes offer URL */}
              {participating === forum.id && (
                <div style={{
                  marginTop: '16px', paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <div>
                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      PFE Offer URL <span style={{ color: 'var(--text-muted)' }}>(optional — link to your offer document)</span>
                    </label>
                    <input
                      type="url"
                      value={offerUrl}
                      onChange={e => setOfferUrl(e.target.value)}
                      placeholder="https://drive.google.com/your-offer..."
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1px solid var(--border)', fontSize: '14px',
                      }}
                    />
                  </div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Optional message (e.g. number of positions, field of work...)"
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid var(--border)', fontSize: '14px', resize: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleParticipate(forum.id)}
                      style={{
                        padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
                      }}>
                      Submit Request
                    </button>
                    <button onClick={() => setParticipating(null)}
                      style={{
                        padding: '8px 20px', borderRadius: '10px', fontSize: '13px',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                      }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {!forums.length && (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
            No forums scheduled yet.
          </div>
        )}
      </div>
    </div>
  )
}