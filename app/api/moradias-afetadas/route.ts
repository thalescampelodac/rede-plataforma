import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateMoradia } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('moradias_afetadas')
      .select(`
        *,
        familias_atingidas (
          id,
          nome_responsavel,
          cpf
        )
      `)
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `logradouro.ilike.%${q}%,bairro.ilike.%${q}%,municipio.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar moradias.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar moradias.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validateMoradia(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('moradias_afetadas').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar moradia.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Moradia cadastrada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar moradia.' }, { status: 500 })
  }
}