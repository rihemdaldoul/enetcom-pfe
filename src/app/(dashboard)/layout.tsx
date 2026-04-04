import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/dashboard-layout'
import type { Role } from '@/types'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email, is_banned')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  // Banned users get kicked out
  if (profile.is_banned) {
    await supabase.auth.signOut()
    redirect('/auth/login?banned=true')
  }

  return (
    <DashboardLayout
      role={profile.role as Role}
      fullName={profile.full_name}
      email={profile.email}
    >
      {children}
    </DashboardLayout>
  )
}