'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const statusStyle: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('applications')
        .select('*, projects(title, type, duration, companies(company_name))')        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      setApplications(data ?? [])
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
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      <p className="mt-1 text-gray-500">{applications.length} application(s) submitted</p>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400">
          You haven't applied to any project yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map(app => (
            <div key={app.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{app.projects?.title}</h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {app.projects?.companies?.company_name} ·{' '}
                    <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs">
                      {app.projects?.type ?? 'PFE'}
                    </span>
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyle[app.status] ?? ''}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                📅 Applied on{' '}
                {new Date(app.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>

              {app.cover_letter && (
                <p className="mt-2 text-sm text-gray-500 italic line-clamp-2">
                  "{app.cover_letter}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}