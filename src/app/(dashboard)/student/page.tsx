'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function StudentDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      const { data } = await supabase
        .from('applications')
        .select('status')
        .eq('student_id', user.id)

      const apps = data ?? []
      setStats({
        total:    apps.length,
        pending:  apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
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

  const cards = [
    { label: 'Total Applied', value: stats.total,    color: 'text-blue-700'   },
    { label: 'Pending',       value: stats.pending,  color: 'text-yellow-600' },
    { label: 'Accepted',      value: stats.accepted, color: 'text-green-700'  },
    { label: 'Rejected',      value: stats.rejected, color: 'text-red-600'    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
      <p className="mt-1 text-gray-500">{email}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/student/projects"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Browse Projects
        </Link>
        <Link
          href="/student/applications"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          My Applications
        </Link>
      </div>
    </div>
  )
}