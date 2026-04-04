import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('companies')
    .select('id, company_name, industry, location, is_verified, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ companies: data })
}

export async function PATCH(req: NextRequest) {
  const { companyId, is_verified } = await req.json()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('companies')
    .update({ is_verified })
    .eq('id', companyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}