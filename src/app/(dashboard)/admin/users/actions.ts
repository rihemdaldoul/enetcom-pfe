'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function banUser(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const banned = formData.get('banned') === 'true'
  await supabase.from('profiles').update({ is_banned: !banned }).eq('id', id)
  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('profiles').delete().eq('id', id)
  revalidatePath('/admin/users')
}

export async function changeRole(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const role = formData.get('role') as string
  await supabase.from('profiles').update({ role }).eq('id', id)
  revalidatePath('/admin/users')
}