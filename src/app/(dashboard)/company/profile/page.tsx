import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompanyProfileClient from './CompanyProfileClient'

export default async function CompanyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  return <CompanyProfileClient company={company} userId={user.id} />
}