'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

export default function CompanyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function loadProjects() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!company) { setLoading(false); return }

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadProjects() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    await loadProjects()
    setDeleting(null)
  }

  const statusColors: Record<string, string> = {
    open:   'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
    filled: 'bg-blue-100 text-blue-700',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading projects...</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="mt-1 text-gray-500">Manage your PFE offers.</p>
        </div>
        <Link
          href="/company/projects/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first PFE offer to get started.</p>
          <Link
            href="/company/projects/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create project
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="rounded-xl border border-gray-200 bg-white p-6 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                    statusColors[project.status]
                  )}>
                    {project.status}
                  </span>
                  <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5 text-xs font-medium">
                    {project.type}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  {project.location && <span>📍 {project.location}</span>}
                  {project.duration && <span>⏱ {project.duration}</span>}
                  {project.deadline && <span>📅 {project.deadline}</span>}
                  <span>👥 {project.slots} slot{project.slots !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/company/projects/${project.id}/edit`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deleting === project.id}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  {deleting === project.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}