import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateDoacao } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('doacoes_recebidas')
      .select('*')
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `nome_item.ilike.%${q}%,categoria_item.ilike.%${q}%,centro_distribuicao.ilike.%${q}%,municipio.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar doações.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar doações.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validateDoacao(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('doacoes_recebidas').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar doação.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Doação cadastrada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar doação.' }, { status: 500 })
  }
}