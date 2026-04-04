'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStatus(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await supabase.from('applications').update({ status }).eq('id', id)
  revalidatePath('/admin/applications')
}

export async function deleteApplication(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('applications').delete().eq('id', id)
  revalidatePath('/admin/applications')
}