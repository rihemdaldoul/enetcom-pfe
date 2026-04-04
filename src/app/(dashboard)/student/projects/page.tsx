import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentProjectsClient from './StudentProjectsClient'

export default async function StudentProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select(`*, companies(company_name, logo_url, location, is_verified)`)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return <StudentProjectsClient projects={projects || []} />
}