'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProjectForm, { defaultFormData, type ProjectFormData } from '@/components/project-form'

export default function NewProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProjectFormData>(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!company) {
      setError('Please set up your company profile first.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('projects')
      .insert({
        company_id:   company.id,
        title:        form.title,
        description:  form.description,
        requirements: form.requirements || null,
        type:         form.type,
        status:       form.status,
        location:     form.location || null,
        is_remote:    form.is_remote,
        duration:     form.duration || null,
        stipend:      form.stipend || null,
        slots:        form.slots,
        deadline:     form.deadline || null,
        tags:         form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/company/projects')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/company/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Project</h1>
        <p className="mt-1 text-gray-500">Post a new PFE opportunity for students.</p>
      </div>
      <ProjectForm
        data={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Create project"
      />
    </div>
  )
}