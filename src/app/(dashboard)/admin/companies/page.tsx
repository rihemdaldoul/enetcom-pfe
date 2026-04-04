import { createClient } from '@/lib/supabase/server'
import { CompanyActions } from './company-actions'

export default async function AdminCompaniesPage() {
  const supabase = await createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('*, profiles(full_name, email, is_banned), projects(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Companies</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {companies?.length ?? 0} registered companies
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {companies?.map((company: any) => (
          <div key={company.id} className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {company.company_name}
                  </p>
                  {company.is_verified && (
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                      background: 'rgba(52,211,153,0.15)', color: 'var(--success)',
                    }}>✓ Verified</span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {company.profiles?.email} &nbsp;·&nbsp;
                  {company.industry ?? 'No industry'} &nbsp;·&nbsp;
                  📁 {company.projects?.[0]?.count ?? 0} projects
                  {company.location && <> &nbsp;·&nbsp; 📍 {company.location}</>}
                </p>
              </div>
              <CompanyActions
                companyId={company.id}
                isVerified={company.is_verified ?? false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}