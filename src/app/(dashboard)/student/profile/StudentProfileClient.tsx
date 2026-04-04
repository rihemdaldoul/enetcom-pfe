'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StudentProfileClient({ profile, userId }: { profile: any, userId: string }) {
  const isProfileComplete = !!(profile?.full_name?.trim() && profile?.cv_url)
  const [editing, setEditing] = useState(!isProfileComplete)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone:     profile?.phone    || '',
    linkedin:  profile?.linkedin || '',
    bio:       profile?.bio      || '',
  })
  const [cvFile, setCvFile]   = useState<File | null>(null)
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()
  const supabase = createClient()

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.'
    if (!profile?.cv_url && !cvFile) errs.cv = 'Please upload your CV — it is required to apply for projects.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setMessage('')
    let cv_url = profile?.cv_url || null

    if (cvFile) {
      const path = `${userId}/profile-cv.pdf`
      const { error: uploadError } = await supabase.storage
        .from('cvs').upload(path, cvFile, { upsert: true })
      if (uploadError) { setMessage('CV upload error: ' + uploadError.message); setSaving(false); return }
      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path)
      cv_url = publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...form, cv_url })
      .eq('id', userId)

    if (error) setMessage('Error: ' + error.message)
    else { setMessage('Profile saved!'); setEditing(false); router.refresh() }
    setSaving(false)
  }

  /* ── VIEW MODE ── */
  if (!editing) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(16px, 4vw, 2rem)' }}>
        {/* Completion banner */}
        {!isProfileComplete && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.35)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
                Profile incomplete — you can't apply to projects yet
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a16207' }}>
                Add your full name and upload a CV to unlock applications.
              </p>
            </div>
          </div>
        )}

        {isProfileComplete && (
          <div style={{
            marginBottom: '20px', padding: '12px 18px', borderRadius: '12px',
            background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
              Profile complete — you can apply to projects!
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {profile?.full_name || 'My Profile'}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '14px' }}>{profile?.email}</p>
          </div>
          <button onClick={() => setEditing(true)} style={{
            padding: '0.6rem 1.4rem', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}>
            ✏️ Edit Profile
          </button>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 'clamp(14px, 3vw, 1.5rem)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem',
        }}>
          <InfoRow label="Phone"    value={profile?.phone}    />
          <InfoRow label="LinkedIn" value={profile?.linkedin} link />
          {profile?.bio && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Bio</p>
              <p style={{ color: 'var(--text-primary)', margin: 0 }}>{profile.bio}</p>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>CV</p>
            {profile?.cv_url ? (
              <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
                background: '#eff6ff', color: 'var(--accent)', borderRadius: 8,
                fontWeight: 600, textDecoration: 'none', fontSize: '14px',
              }}>
                📄 View CV
              </a>
            ) : (
              <p style={{ color: 'var(--danger)', margin: 0, fontSize: '14px', fontWeight: 600 }}>
                ⚠️ No CV uploaded — required to apply
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── EDIT / SETUP MODE ── */
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(16px, 4vw, 2rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {isProfileComplete ? 'Edit Profile' : '👋 Set Up Your Profile'}
        </h1>
        {isProfileComplete && (
          <button onClick={() => setEditing(false)} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '0.4rem 1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px',
          }}>
            Cancel
          </button>
        )}
      </div>

      {!isProfileComplete && (
        <div style={{
          marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.25)',
          fontSize: '13px', color: 'var(--accent)', lineHeight: 1.5,
        }}>
          ℹ️ Fill in your <strong>full name</strong> and upload a <strong>CV (PDF)</strong> to be able to apply for PFE projects.
        </div>
      )}

      {/* Full Name — required */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          Full Name <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          type="text"
          value={form.full_name}
          onChange={e => { setForm(f => ({ ...f, full_name: e.target.value })); setFieldErrors(fe => ({ ...fe, full_name: '' })) }}
          placeholder="Ahmed Ben Salem"
          style={{
            width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.95rem', boxSizing: 'border-box',
            border: `1px solid ${fieldErrors.full_name ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 8,
          }}
        />
        {fieldErrors.full_name && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--danger)' }}>{fieldErrors.full_name}</p>
        )}
      </div>

      {/* Phone + LinkedIn */}
      {[
        { label: 'Phone',        key: 'phone',    placeholder: '+216 XX XXX XXX' },
        { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'linkedin.com/in/yourname' },
      ].map(({ label, key, placeholder }) => (
        <div key={key} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {label}
          </label>
          <input
            type="text"
            value={form[key as keyof typeof form]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>
      ))}

      {/* Bio */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Bio</label>
        <textarea
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
          placeholder="Tell companies a bit about yourself..."
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      {/* CV Upload — required */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          CV (PDF) <span style={{ color: 'var(--danger)' }}>*</span>
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>required to apply for projects</span>
        </label>
        {profile?.cv_url && !cvFile && (
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
              📄 Current CV
            </a>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>— upload a new one to replace it</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf" onChange={e => { setCvFile(e.target.files?.[0] || null); setFieldErrors(fe => ({ ...fe, cv: '' })) }} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: 8, width: '100%', cursor: 'pointer',
            border: `2px dashed ${fieldErrors.cv ? 'var(--danger)' : 'var(--border)'}`,
            background: cvFile ? 'rgba(22,163,74,0.05)' : 'var(--bg-secondary)',
            color: cvFile ? 'var(--success)' : 'var(--text-secondary)', fontWeight: cvFile ? 600 : 400, fontSize: '14px',
          }}
        >
          {cvFile ? `✅ ${cvFile.name}` : '📤 Upload CV (PDF)'}
        </button>
        {fieldErrors.cv && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--danger)' }}>{fieldErrors.cv}</p>
        )}
      </div>

      {message && (
        <p style={{ marginBottom: '1rem', fontSize: '14px', fontWeight: 600, color: message.startsWith('Error') ? 'var(--danger)' : 'var(--success)' }}>
          {message}
        </p>
      )}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: '0.75rem', background: 'var(--accent)', color: '#fff',
        border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem',
        cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  )
}

function InfoRow({ label, value, link }: { label: string; value?: string; link?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2, marginTop: 0 }}>{label}</p>
      {link && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '14px' }}>{value}</a>
      ) : (
        <p style={{ color: 'var(--text-primary)', fontWeight: 500, margin: 0, fontSize: '14px' }}>{value || '—'}</p>
      )}
    </div>
  )
}