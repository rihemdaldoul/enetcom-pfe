'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type CVData = {
  summary: string
  education: { degree: string; institution: string; year: string; details: string }[]
  skills: { technical: string[]; soft: string[]; languages: string[] }
  experience: { title: string; company: string; period: string; description: string }[]
  projects: { name: string; description: string; technologies: string[] }[]
  objective: string
}

export default function CVGenerator() {
  const printRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    fullName:     '',
    email:        '',
    phone:        '',
    location:     '',
    linkedin:     '',
    education:    '',
    skills:       '',
    experience:   '',   // internships
    projects:     '',   // academic/personal projects
    languages:    'Arabic, French, English',
    objective:    '',
    projectTitle: '',
    companyName:  '',
  })

  const [cv, setCv]           = useState<CVData | null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError]     = useState('')
  const [saved, setSaved]     = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleGenerate() {
    if (!form.fullName || !form.education || !form.skills) {
      setError('Please fill in Name, Education, and Skills at minimum.')
      return
    }
    setError('')
    setLoading(true)
    setCv(null)

    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCv(data.cv)
      setSaved(false)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!cv) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: dbError } = await supabase.from('cvs').upsert({
      student_id: user.id,
      title:      `CV - ${form.fullName}`,
      content:    cv,
      is_default: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id' })

    if (dbError) { setError(dbError.message); return }
    setSaved(true)
  }

  // ✅ Fixed: use jspdf + html2canvas directly — avoids html2pdf.js "lab()" color crash
  async function handleDownloadPDF() {
    if (!printRef.current) return
    setPdfLoading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        // ✅ This tells html2canvas to ignore unsupported CSS color functions
        onclone: (doc) => {
          // Strip any computed styles that use lab/oklch colors
          const allEls = doc.querySelectorAll('*')
          allEls.forEach((el) => {
            const style = (el as HTMLElement).style
            style.removeProperty('color')
          })
        },
      })

      const imgData  = canvas.toDataURL('image/jpeg', 0.98)
      const pdf      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageW    = pdf.internal.pageSize.getWidth()
      const pageH    = pdf.internal.pageSize.getHeight()
      const imgH     = (canvas.height * pageW) / canvas.width

      // Handle multi-page if content is taller than one A4
      if (imgH <= pageH) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH)
      } else {
        let yOffset = 0
        while (yOffset < imgH) {
          if (yOffset > 0) pdf.addPage()
          pdf.addImage(imgData, 'JPEG', 0, -yOffset, pageW, imgH)
          yOffset += pageH
        }
      }

      pdf.save(`CV-${form.fullName || 'student'}.pdf`)
    } catch (err: any) {
      setError('PDF generation failed: ' + err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  const inputClass = "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    + " bg-white text-gray-900 border-gray-200 placeholder-gray-400"

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          AI CV Generator
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Fill in your details and let AI craft your professional CV.
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* ── FORM ── */}
        <div className="space-y-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your Information
          </h2>

          {/* Basic info */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Personal Details
            </legend>

            {[
              { name: 'fullName',  label: 'Full Name *',   placeholder: 'Ahmed Ben Salem' },
              { name: 'email',     label: 'Email',         placeholder: 'ahmed@enetcom.tn' },
              { name: 'phone',     label: 'Phone',         placeholder: '+216 XX XXX XXX' },
              { name: 'location',  label: 'Location',      placeholder: 'Sfax, Tunisia' },
              { name: 'linkedin',  label: 'LinkedIn URL',  placeholder: 'linkedin.com/in/ahmed' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                <input name={f.name} value={form[f.name as keyof typeof form]}
                  onChange={handleChange} placeholder={f.placeholder}
                  className={inputClass} />
              </div>
            ))}
          </fieldset>

          {/* Target job */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Target Position
            </legend>
            {[
              { name: 'projectTitle', label: 'cv title', placeholder: 'Full-Stack Web Developer Intern' },
              { name: 'companyName',  label: 'Target Company',  placeholder: 'Tech Corp Tunisia' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                <input name={f.name} value={form[f.name as keyof typeof form]}
                  onChange={handleChange} placeholder={f.placeholder}
                  className={inputClass} />
              </div>
            ))}
          </fieldset>

          {/* Textarea sections */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Background
            </legend>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text-secondary)' }}>Education *</label>
              <textarea name="education" value={form.education} onChange={handleChange} rows={2}
                placeholder="Engineering degree in CS, ENET'Com Sfax, 2022–2025"
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text-secondary)' }}>
                Internships / Work Experience
              </label>
              <textarea name="experience" value={form.experience} onChange={handleChange} rows={3}
                placeholder={"Internship at Telnet, June–Aug 2024 — built REST API with Node.js\nInternship at Vermeg, Jan 2024 — React dashboard"}
                className={inputClass} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                List each internship on a new line with company, date, and what you did.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text-secondary)' }}>
                Academic & Personal Projects
              </label>
              <textarea name="projects" value={form.projects} onChange={handleChange} rows={3}
                placeholder={"PFE Platform — Next.js + Supabase, manages student internships (2025)\nMobile App — Flutter + Firebase, e-commerce prototype (2024)"}
                className={inputClass} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Project name — tech stack, short description and year.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text-secondary)' }}>Technical Skills *</label>
              <textarea name="skills" value={form.skills} onChange={handleChange} rows={2}
                placeholder="React, Next.js, Node.js, Python, SQL, Git, Docker..."
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text-secondary)' }}>Languages</label>
              <input name="languages" value={form.languages} onChange={handleChange}
                placeholder="Arabic (native), French (B2), English (B2)"
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text-secondary)' }}>Career Objective</label>
              <textarea name="objective" value={form.objective} onChange={handleChange} rows={2}
                placeholder="Passionate engineer seeking to apply my skills in a challenging internship..."
                className={inputClass} />
            </div>
          </fieldset>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2 bg-red-50 text-red-600 border border-red-200">
              {error}
            </p>
          )}

          <button onClick={handleGenerate} disabled={loading}
            className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: loading ? 'var(--accent)' : 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}>
            {loading ? '✨ Generating your CV...' : '✨ Generate CV with AI'}
          </button>
        </div>

        {/* ── RIGHT PANEL: preview placeholder or loading ── */}
        <div className="hidden lg:block">
          {!cv && !loading && (
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed h-64
              text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <p className="text-4xl mb-3">📄</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Your generated CV will appear here
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center rounded-xl border h-64 text-center"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <div>
                <p className="text-4xl mb-3 animate-bounce">🤖</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AI is crafting your CV...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── GENERATED CV ── */}
      {cv && (
        <div className="mt-8">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={handleDownloadPDF} disabled={pdfLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1e293b' }}>
              {pdfLoading ? '⏳ Generating...' : '⬇️ Download PDF'}
            </button>
            <button onClick={handleSave} disabled={saved}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
                disabled:opacity-60"
              style={{ backgroundColor: 'var(--success)' }}>
              {saved ? '✅ Saved!' : '💾 Save CV'}
            </button>
            <button onClick={() => { setCv(null); setSaved(false) }}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              🔄 Regenerate
            </button>
          </div>

          {/* ── CV DOCUMENT (white, print-safe, no Tailwind color functions) ── */}
          <div
            ref={printRef}
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              maxWidth: '794px',   // A4 width in px at 96dpi
              margin: '0 auto',
            }}
          >
            {/* ── HEADER BAND ── */}
            <div style={{ backgroundColor: '#1d4ed8', color: '#ffffff', padding: '28px 36px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                {form.fullName}
              </h1>
              {(form.projectTitle || form.companyName) && (
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#bfdbfe', fontWeight: 500 }}>
                  {[form.projectTitle, form.companyName].filter(Boolean).join(' · ')}
                </p>
              )}
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#dbeafe' }}>
                {form.email    && <span>✉ {form.email}</span>}
                {form.phone    && <span>📞 {form.phone}</span>}
                {form.location && <span>📍 {form.location}</span>}
                {form.linkedin && <span>🔗 {form.linkedin}</span>}
              </div>
            </div>

            {/* ── TWO COLUMN BODY ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0 }}>

              {/* LEFT COLUMN — Summary, Skills, Languages */}
              <div style={{ backgroundColor: '#f8fafc', padding: '24px 20px', borderRight: '1px solid #e2e8f0' }}>

                {/* Summary */}
                {cv.summary && (
                  <Section title="Summary" accent="#1d4ed8">
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                      {cv.summary}
                    </p>
                  </Section>
                )}

                {/* Technical Skills */}
                {cv.skills?.technical?.length > 0 && (
                  <Section title="Technical Skills" accent="#1d4ed8">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {cv.skills.technical.map((s, i) => (
                        <span key={i} style={{
                          fontSize: '11px', padding: '2px 8px',
                          backgroundColor: '#eff6ff', color: '#1d4ed8',
                          border: '1px solid #bfdbfe', borderRadius: '20px',
                        }}>{s}</span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Soft Skills */}
                {cv.skills?.soft?.length > 0 && (
                  <Section title="Soft Skills" accent="#1d4ed8">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {cv.skills.soft.map((s, i) => (
                        <span key={i} style={{
                          fontSize: '11px', padding: '2px 8px',
                          backgroundColor: '#f8fafc', color: '#475569',
                          border: '1px solid #e2e8f0', borderRadius: '20px',
                        }}>{s}</span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Languages */}
                {cv.skills?.languages?.length > 0 && (
                  <Section title="Languages" accent="#1d4ed8">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {cv.skills.languages.map((l, i) => (
                        <span key={i} style={{ fontSize: '12px', color: '#475569' }}>
                          🌐 {l}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Education */}
                {cv.education?.length > 0 && (
                  <Section title="Education" accent="#1d4ed8">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cv.education.map((edu, i) => (
                        <div key={i}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                            {edu.degree}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                            {edu.institution}
                          </p>
                          <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                            {edu.year}
                          </p>
                          {edu.details && (
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                              {edu.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>

              {/* RIGHT COLUMN — Experience + Projects */}
              <div style={{ padding: '24px 28px' }}>

                {/* Experience / Internships */}
                {cv.experience?.length > 0 && (
                  <Section title="Experience & Internships" accent="#1d4ed8">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {cv.experience.map((exp, i) => (
                        <div key={i} style={{ borderLeft: '3px solid #bfdbfe', paddingLeft: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                              {exp.title}
                            </p>
                            <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                              {exp.period}
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#1d4ed8', fontWeight: 500 }}>
                            {exp.company}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Academic / Personal Projects */}
                {cv.projects?.length > 0 && (
                  <Section title="Projects" accent="#1d4ed8">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {cv.projects.map((proj, i) => (
                        <div key={i} style={{ borderLeft: '3px solid #e0f2fe', paddingLeft: '12px' }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                            {proj.name}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                            {proj.description}
                          </p>
                          {proj.technologies?.length > 0 && (
                            <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {proj.technologies.map((t, j) => (
                                <span key={j} style={{
                                  fontSize: '10px', padding: '1px 6px',
                                  backgroundColor: '#f1f5f9', color: '#64748b',
                                  border: '1px solid #e2e8f0', borderRadius: '4px',
                                }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Objective — only if no experience/projects */}
                {!cv.experience?.length && !cv.projects?.length && cv.objective && (
                  <Section title="Career Objective" accent="#1d4ed8">
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                      {cv.objective}
                    </p>
                  </Section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── helper: section block ──────────────────────────────────────────────────
function Section({
  title, accent, children,
}: {
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
      }}>
        <span style={{ width: '3px', height: '14px', backgroundColor: accent, borderRadius: '2px', flexShrink: 0 }} />
        <h2 style={{
          margin: 0, fontSize: '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: accent,
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}