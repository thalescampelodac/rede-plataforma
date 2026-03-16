import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('programas_governamentais')
      .select('id, nome_programa, esfera, municipio, estado')
      .order('nome_programa', { ascending: true })
      .limit(20)

    if (q) {
      query = query.or(
        `nome_programa.ilike.%${q}%,municipio.ilike.%${q}%,esfera.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar programas.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar programas.' }, { status: 500 })
  }
}