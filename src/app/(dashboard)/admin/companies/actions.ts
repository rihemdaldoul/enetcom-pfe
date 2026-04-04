'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleVerify(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const verified = formData.get('verified') === 'true'
  await supabase.from('companies').update({ is_verified: !verified }).eq('id', id)
  revalidatePath('/admin/companies')
}

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('companies').delete().eq('id', id)
  revalidatePath('/admin/companies')
}