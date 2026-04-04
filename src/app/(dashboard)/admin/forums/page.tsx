import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ForumStatusSelect, ForumDeleteButton } from './forum-actions'

export default async function AdminForumsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: forums } = await supabase
    .from('forums')
    .select('*, forum_participations(count)')
    .order('event_date', { ascending: true })

  async function createForum(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('forums').insert({
      title:       formData.get('title') as string,
      description: formData.get('description') as string,
      location:    formData.get('location') as string,
      event_date:  formData.get('event_date') as string,
      deadline:    formData.get('deadline') as string || null,
      status:      'upcoming',
      created_by:  user!.id,
    })
    revalidatePath('/admin/forums')
  }

  async function updateForumStatus(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('forums')
      .update({ status: formData.get('status') as string })
      .eq('id', formData.get('id') as string)
    revalidatePath('/admin/forums')
  }

  async function deleteForum(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('forums').delete().eq('id', formData.get('id') as string)
    revalidatePath('/admin/forums')
  }

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Forums</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Create and manage recruitment forums
        </p>
      </div>

      {/* Create Forum Form */}
      <div className="rounded-2xl border p-6 mb-8"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Create New Forum
        </h2>
        <form action={createForum} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Title *
              </label>
              <input name="title" required placeholder="e.g. Spring 2025 PFE Forum"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Location *
              </label>
              <input name="location" required placeholder="e.g. ENET'Com Campus, Amphitheater A"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Event Date *
              </label>
              <input name="event_date" type="datetime-local" required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Registration Deadline
              </label>
              <input name="deadline" type="datetime-local"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea name="description" rows={3}
              placeholder="Describe the forum, what to expect, who should attend..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', resize: 'none' }} />
          </div>
          <div>
            <button type="submit" style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
            }}>
              Create Forum
            </button>
          </div>
        </form>
      </div>

      {/* Forums List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {forums?.map((forum: any) => (
          <div key={forum.id} className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                    background: forum.status === 'upcoming' ? 'rgba(91,110,245,0.15)' :
                                forum.status === 'ongoing' ? 'rgba(52,211,153,0.15)' : 'rgba(156,163,175,0.15)',
                    color: forum.status === 'upcoming' ? 'var(--accent)' :
                           forum.status === 'ongoing' ? 'var(--success)' : 'var(--text-muted)',
                  }}>{forum.status}</span>
                </div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {forum.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  📍 {forum.location} &nbsp;·&nbsp;
                  📅 {new Date(forum.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} &nbsp;·&nbsp;
                  👥 {forum.forum_participations?.[0]?.count ?? 0} participants
                </p>
                {forum.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {forum.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href={`/admin/forums/${forum.id}`}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}>
                  Manage
                </Link>
                <ForumStatusSelect
                    forumId={forum.id}
                    currentStatus={forum.status}
                    updateAction={updateForumStatus}
                    />
                    <ForumDeleteButton
                    forumId={forum.id}
                    deleteAction={deleteForum}
                    />
              </div>
            </div>
          </div>
        ))}
        {!forums?.length && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No forums created yet. Create your first forum above.
          </div>
        )}
      </div>
    </div>
  )
}