import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import ProjectActions from './project-actions'

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, companies(company_name), applications(count)')
    .order('created_at', { ascending: false })

  async function updateStatus(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const id = formData.get('id') as string
    const status = formData.get('status') as string
    await supabase.from('projects').update({ status }).eq('id', id)
    revalidatePath('/admin/projects')
  }

  async function deleteProject(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const id = formData.get('id') as string
    await supabase.from('projects').delete().eq('id', id)
    revalidatePath('/admin/projects')
  }

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All Projects</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {projects?.length ?? 0} projects across all companies
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {projects?.map((project: any) => (
          <div key={project.id} className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                    background: project.status === 'open' ? 'rgba(52,211,153,0.15)' :
                                project.status === 'filled' ? 'rgba(91,110,245,0.15)' : 'rgba(156,163,175,0.15)',
                    color: project.status === 'open' ? 'var(--success)' :
                           project.status === 'filled' ? 'var(--accent)' : 'var(--text-muted)',
                  }}>{project.status}</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                    background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                  }}>{project.type}</span>
                </div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {project.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  🏢 {project.companies?.company_name ?? '—'} &nbsp;·&nbsp;
                  👥 {project.applications?.[0]?.count ?? 0} applications
                  {project.location && <> &nbsp;·&nbsp; 📍 {project.location}</>}
                </p>
              </div>

              {/* ✅ Client component handles all interactions */}
              <ProjectActions
                projectId={project.id}
                currentStatus={project.status}
                updateStatus={updateStatus}
                deleteProject={deleteProject}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}