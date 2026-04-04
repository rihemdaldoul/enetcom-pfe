'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProjectForm, { type ProjectFormData } from '@/components/project-form'

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState<ProjectFormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setForm({
          title:        data.title,
          description:  data.description,
          requirements: data.requirements ?? '',
          type:         data.type,
          status:       data.status,
          location:     data.location ?? '',
          is_remote:    data.is_remote,
          duration:     data.duration ?? '',
          stipend:      data.stipend ?? '',
          slots:        data.slots,
          deadline:     data.deadline ?? '',
          tags:         (data.tags ?? []).join(', '),
        })
      }
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('projects')
      .update({
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
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/company/projects')
  }

  if (!form) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading project...</p>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/company/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Project</h1>
        <p className="mt-1 text-gray-500">Update your PFE offer details.</p>
      </div>
      <ProjectForm
        data={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Save changes"
      />
    </div>
  )
}