import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateVoluntario } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('voluntarios_ativos')
      .select('*')
      .order('created_at', { ascending: false })

    if (q) {
      const digits = q.replace(/\D/g, '')
      query = query.or(
        `nome.ilike.%${q}%,cpf.ilike.%${digits || q}%,municipio.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar voluntários.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar voluntários.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validateVoluntario(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existing } = await supabase
      .from('voluntarios_ativos')
      .select('id')
      .eq('cpf', normalized.cpf)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'Já existe um voluntário com esse CPF.', errors: { cpf: 'CPF já cadastrado.' } },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('voluntarios_ativos').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar voluntário.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Voluntário cadastrado com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar voluntário.' }, { status: 500 })
  }
}