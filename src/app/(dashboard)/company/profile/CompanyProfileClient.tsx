'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CompanyProfileClient({ company, userId }: { company: any, userId: string }) {
  const [editing, setEditing] = useState(!company) // if no profile yet, show form directly
  const [form, setForm] = useState({
    company_name: company?.company_name || '',
    industry:     company?.industry || '',
    website:      company?.website || '',
    location:     company?.location || '',
    description:  company?.description || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    if (company) {
      const { error } = await supabase
        .from('companies')
        .update(form)
        .eq('profile_id', userId)
      if (error) setMessage('Error: ' + error.message)
      else { setMessage('Profile updated!'); setEditing(false); router.refresh() }
    } else {
      const { error } = await supabase
        .from('companies')
        .insert({ ...form, profile_id: userId, is_verified: false })
      if (error) setMessage('Error: ' + error.message)
      else { setMessage('Profile created!'); setEditing(false); router.refresh() }
    }
    setSaving(false)
  }

  if (!editing && company) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {company.company_name}
            </h1>
            <span style={{
              display: 'inline-block', marginTop: '0.4rem',
              padding: '0.2rem 0.8rem', borderRadius: 20,
              background: company.is_verified ? '#dcfce7' : '#fef9c3',
              color: company.is_verified ? '#16a34a' : '#d97706',
              fontSize: '0.8rem', fontWeight: 600
            }}>
              {company.is_verified ? '✓ Verified' : 'Pending verification'}
            </span>
          </div>
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '0.6rem 1.4rem', background: 'var(--accent)',
              color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontWeight: 600
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '1.5rem', display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: '1.2rem'
        }}>
          <InfoRow label="Industry" value={company.industry} />
          <InfoRow label="Location" value={company.location} />
          <InfoRow label="Website" value={company.website} link />
          <InfoRow label="Member since" value={new Date(company.created_at).toLocaleDateString()} />
          {company.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Description</p>
              <p style={{ color: 'var(--text-primary)' }}>{company.description}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {company ? 'Edit Company Profile' : 'Set Up Company Profile'}
        </h1>
        {company && (
          <button onClick={() => setEditing(false)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
        )}
      </div>

      {[
        { label: 'Company Name *', key: 'company_name', type: 'text' },
        { label: 'Website', key: 'website', type: 'text' },
        { label: 'Location', key: 'location', type: 'text' },
      ].map(({ label, key, type }) => (
        <div key={key} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{label}</label>
          <input
            type={type}
            value={form[key as keyof typeof form]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>
      ))}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Industry</label>
        <select
          value={form.industry}
          onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.95rem' }}
        >
          {['Software & Technology','Finance','Healthcare','Education','Manufacturing','Consulting','Other'].map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      {message && (
        <p style={{ marginBottom: '1rem', color: message.startsWith('Error') ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{message}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !form.company_name}
        style={{
          width: '100%', padding: '0.75rem', background: 'var(--accent)',
          color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
          fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? 'Saving...' : company ? 'Save Changes' : 'Create Profile'}
      </button>
    </div>
  )
}

function InfoRow({ label, value, link }: { label: string, value: string, link?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      {link && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>{value}</a>
      ) : (
        <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</p>
      )}
    </div>
  )
}