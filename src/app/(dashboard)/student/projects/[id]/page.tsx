'use client'

import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ProfileStatus = {
  complete: boolean
  missing: string[]
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [project, setProject]               = useState<any>(null)
  const [profileStatus, setProfileStatus]   = useState<ProfileStatus | null>(null)
  const [coverLetter, setCoverLetter]       = useState('')
  const [cvFile, setCvFile]                 = useState<File | null>(null)
  const [isPending, startTransition]        = useTransition()
  const [applied, setApplied]               = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [error, setError]                   = useState('')
  const [loading, setLoading]               = useState(true)
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: proj } = await supabase
        .from('projects')
        .select('*, companies(company_name, industry, description)')
        .eq('id', id)
        .single()
      setProject(proj)

      if (user) {
        // Check profile completeness
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, cv_url, email')
          .eq('id', user.id)
          .single()

        const missing: string[] = []
        if (!profile?.full_name?.trim()) missing.push('Full name')
        if (!profile?.email?.trim())     missing.push('Email')
        if (!profile?.cv_url)            missing.push('CV upload')
        setProfileStatus({ complete: missing.length === 0, missing })

        // Check already applied
        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .eq('student_id', user.id)
          .eq('project_id', id)
          .single()
        if (existing) setAlreadyApplied(true)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleApply = () => {
    if (!coverLetter.trim()) { setError('Please write a cover letter before applying.'); return }
    if (!cvFile)             { setError('Please upload your CV (PDF).'); return }
    if (cvFile.size > 5 * 1024 * 1024) { setError('CV file must be under 5MB.'); return }
    setError('')

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUploadProgress('Uploading CV...')
      const fileExt = cvFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('cvs').upload(filePath, cvFile, { upsert: true })

      if (uploadError) {
        setError('Failed to upload CV: ' + uploadError.message)
        setUploadProgress('')
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(filePath)
      setUploadProgress('Submitting application...')

      const { error: insertError } = await supabase
        .from('applications')
        .insert({ student_id: user.id, project_id: id, cover_letter: coverLetter, cv_url: publicUrl, status: 'pending' })

      setUploadProgress('')
      if (insertError) { setError(insertError.message) }
      else { setApplied(true); setTimeout(() => router.push('/student/applications'), 1500) }
    })
  }

  /* ── loading / not found ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading project...</p>
    </div>
  )
  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
      <p style={{ color: 'var(--danger)' }}>Project not found.</p>
    </div>
  )

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: '720px', margin: '0 auto' }}>
      <Link href="/student/projects" style={{
        fontSize: '14px', color: 'var(--text-muted)',
        textDecoration: 'none', display: 'inline-block', marginBottom: '20px',
      }}>
        ← Back to Projects
      </Link>

      {/* ── Project Card ── */}
      <div style={{
        borderRadius: '16px', border: '1px solid var(--border)',
        background: 'var(--bg-card)', padding: 'clamp(16px, 3vw, 24px)', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {project.title}
          </h1>
          <span style={{
            fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
            background: 'rgba(59,130,246,0.1)', color: 'var(--accent)',
            border: '1px solid rgba(59,130,246,0.2)', fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {project.type ?? 'PFE'}
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {project.companies?.company_name} · {project.companies?.industry}
        </p>

        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Description
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {project.description}
          </p>
        </div>

        {project.tags?.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Tags</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {project.tags.map((tag: string) => (
                <span key={tag} style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '999px',
                  border: '1px solid var(--border)', color: 'var(--text-secondary)',
                }}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          ⏱ Duration: {project.duration ?? 'Not specified'}
          {project.deadline && (
            <> &nbsp;·&nbsp; 📅 Deadline: {new Date(project.deadline).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}</>
          )}
        </p>
      </div>

      {/* ── Profile Incomplete Banner ── */}
      {profileStatus && !profileStatus.complete && (
        <div style={{
          borderRadius: '16px', marginBottom: '20px',
          border: '1px solid rgba(217,119,6,0.4)',
          background: 'rgba(217,119,6,0.06)',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#92400e' }}>
                Complete your profile to apply
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#a16207', lineHeight: 1.5 }}>
                You need to fill in the following before you can apply to any project:
              </p>
              <ul style={{ margin: '0 0 14px', paddingLeft: '18px' }}>
                {profileStatus.missing.map(m => (
                  <li key={m} style={{ fontSize: '13px', color: '#a16207', marginBottom: '3px' }}>
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/student/profile" style={{
                display: 'inline-block', padding: '8px 18px', borderRadius: '8px',
                background: '#d97706', color: '#fff', fontWeight: 600,
                fontSize: '13px', textDecoration: 'none',
              }}>
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Apply Section ── */}
      {alreadyApplied ? (
        <div style={{
          borderRadius: '16px', border: '1px solid rgba(59,130,246,0.3)',
          background: 'rgba(59,130,246,0.05)', padding: '16px',
          fontSize: '14px', color: 'var(--accent)',
        }}>
          ✅ You have already applied to this project.
        </div>
      ) : applied ? (
        <div style={{
          borderRadius: '16px', border: '1px solid rgba(22,163,74,0.3)',
          background: 'rgba(22,163,74,0.05)', padding: '16px',
          fontSize: '14px', color: 'var(--success)',
        }}>
          🎉 Application submitted! Redirecting...
        </div>
      ) : profileStatus && !profileStatus.complete ? (
        /* Profile incomplete — show locked apply box */
        <div style={{
          borderRadius: '16px', border: '1px solid var(--border)',
          background: 'var(--bg-secondary)', padding: '24px',
          textAlign: 'center', opacity: 0.6,
        }}>
          <p style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Complete your profile above to unlock applications.
          </p>
        </div>
      ) : (
        /* ── Application Form ── */
        <div style={{
          borderRadius: '16px', border: '1px solid var(--border)',
          background: 'var(--bg-card)', padding: 'clamp(16px, 3vw, 24px)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', marginTop: 0 }}>
            Apply for this Project
          </h2>

          {error && (
            <div style={{
              marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)',
              fontSize: '13px', color: 'var(--danger)',
            }}>{error}</div>
          )}

          {/* Cover Letter */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Cover Letter *
            </label>
            <textarea
              rows={6}
              placeholder="Introduce yourself and explain why you're a great fit for this project..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              disabled={isPending}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1px solid var(--border)', fontSize: '14px',
                resize: 'vertical', outline: 'none',
                opacity: isPending ? 0.5 : 1, boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
              {coverLetter.length} characters
            </p>
          </div>

          {/* CV Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Upload CV * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(PDF, max 5MB)</span>
            </label>
            <div style={{
              border: '2px dashed var(--border)', borderRadius: '10px',
              padding: '20px', textAlign: 'center',
              background: cvFile ? 'rgba(22,163,74,0.03)' : 'var(--bg-secondary)',
              borderColor: cvFile ? 'rgba(22,163,74,0.4)' : 'var(--border)',
              transition: 'all 0.2s',
            }}>
              {cvFile ? (
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600, margin: '0 0 4px' }}>✓ {cvFile.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button onClick={() => setCvFile(null)} style={{
                    fontSize: '12px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer',
                  }}>Remove</button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', marginTop: 0 }}>
                    📄 Drag & drop your CV here or click to browse
                  </p>
                  <label style={{
                    display: 'inline-block', padding: '8px 16px', borderRadius: '8px',
                    background: 'var(--accent)', color: 'white',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Choose File
                    <input type="file" accept=".pdf,.doc,.docx"
                      onChange={e => setCvFile(e.target.files?.[0] ?? null)}
                      style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={isPending || !coverLetter.trim() || !cvFile}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: 'var(--accent)', color: 'white',
              fontSize: '14px', fontWeight: 600, border: 'none',
              cursor: isPending || !coverLetter.trim() || !cvFile ? 'not-allowed' : 'pointer',
              opacity: isPending || !coverLetter.trim() || !cvFile ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isPending ? (uploadProgress || 'Submitting...') : 'Submit Application'}
          </button>
        </div>
      )}
    </div>
  )
}