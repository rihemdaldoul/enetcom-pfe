'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

export default function StudentProjectsClient({ projects }: { projects: any[] }) {
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Collect all unique tags across all projects
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    projects.forEach(p => (p.tags || []).forEach((t: string) => tags.add(t)))
    return Array.from(tags).sort()
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase())) ||
        p.companies?.company_name?.toLowerCase().includes(search.toLowerCase())
      const matchTag = !selectedTag || (p.tags || []).includes(selectedTag)
      const matchType = !selectedType || p.type === selectedType
      return matchSearch && matchTag && matchType
    })
  }, [projects, search, selectedTag, selectedType])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Browse PFE Projects
        <span style={{ marginLeft: 10, fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          ({filtered.length} of {projects.length})
        </span>
      </h1>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search by title, tag, company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 220, padding: '0.65rem 1rem',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: '0.95rem', outline: 'none'
          }}
        />
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          style={{ padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', minWidth: 150 }}
        >
          <option value="">All Tags</option>
          {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{ padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', minWidth: 130 }}
        >
          <option value="">All Types</option>
          <option value="PFE">PFE</option>
          <option value="PFA">PFA</option>
          <option value="internship">Internship</option>
        </select>
        {(search || selectedTag || selectedType) && (
          <button
            onClick={() => { setSearch(''); setSelectedTag(''); setSelectedType('') }}
            style={{ padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>No projects match your search.</p>
          <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Try different keywords or clear the filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(project => (
            <Link key={project.id} href={`/student/projects/${project.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '1.25rem 1.5rem',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                cursor: 'pointer'
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--accent-glow)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {project.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
                      {project.companies?.company_name} · {project.location || 'Remote'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.25rem 0.7rem', background: '#eff6ff', color: 'var(--accent)', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                      {project.type}
                    </span>
                    {project.is_remote && (
                      <span style={{ padding: '0.25rem 0.7rem', background: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </p>
                )}

                {(project.tags || []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: '0.75rem' }}>
                    {project.tags.map((tag: string) => (
                      <span key={tag} style={{
                        padding: '0.2rem 0.6rem', background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)', borderRadius: 6, fontSize: '0.78rem',
                        border: '1px solid var(--border)',
                        fontWeight: selectedTag === tag ? 700 : 400,
                        color: selectedTag === tag ? 'var(--accent)' : 'var(--text-secondary)',
                        borderColor: selectedTag === tag ? 'var(--accent)' : 'var(--border)'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {project.duration && <span>⏱ {project.duration}</span>}
                  {project.stipend && <span>💰 {project.stipend}</span>}
                  {project.deadline && <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}