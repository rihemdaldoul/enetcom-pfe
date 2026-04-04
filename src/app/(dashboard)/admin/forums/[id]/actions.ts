'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateParticipation(formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const forumId = formData.get('forum_id') as string

  await supabase.from('forum_participations')
    .update({ status })
    .eq('id', id)

  revalidatePath(`/admin/forums/${forumId}`)
}