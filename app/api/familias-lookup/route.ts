import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('familias_atingidas')
      .select('id, nome_responsavel, cpf, municipio, estado')
      .order('nome_responsavel', { ascending: true })
      .limit(20)

    if (q) {
      const digits = q.replace(/\D/g, '')
      query = query.or(
        `nome_responsavel.ilike.%${q}%,cpf.ilike.%${digits || q}%,municipio.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar famílias.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar famílias.' }, { status: 500 })
  }
}