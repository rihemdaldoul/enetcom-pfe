'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CompanyDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    open: 0,
    applications: 0,
  })
  const [hasProfile, setHasProfile] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!company) {
        setHasProfile(false)
        setLoading(false)
        return
      }

      const { data: projects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('company_id', company.id)

      const { count: appCount } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('project_id', (projects ?? []).map(p => p.id))

      setStats({
        projects:     (projects ?? []).length,
        open:         (projects ?? []).filter(p => p.status === 'open').length,
        applications: appCount ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
      <p className="mt-1 text-gray-500">Manage your PFE offers and applications.</p>

      {/* No profile warning */}
      {!hasProfile && (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            ⚠️ Complete your company profile to start posting projects.
          </p>
          <Link
            href="/company/profile"
            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
          >
            Set up profile
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Projects',   value: stats.projects,     color: 'text-purple-700' },
          { label: 'Open Projects',    value: stats.open,         color: 'text-green-700'  },
          { label: 'Applications',     value: stats.applications, color: 'text-blue-700'   },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/company/projects/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Post new project
          </Link>
          <Link
            href="/company/projects"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            View all projects
          </Link>
          <Link
            href="/company/profile"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Edit profile
          </Link>
        </div>
      </div>
    </div>
  )
}