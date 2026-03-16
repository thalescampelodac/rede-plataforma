import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validatePrograma } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('programas_governamentais')
      .select('*')
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `nome_programa.ilike.%${q}%,orgao_responsavel.ilike.%${q}%,municipio.ilike.%${q}%`
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validatePrograma(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('programas_governamentais').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar programa.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Programa cadastrado com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar programa.' }, { status: 500 })
  }
}