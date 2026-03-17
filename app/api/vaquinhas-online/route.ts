import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateVaquinha } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('vaquinhas_online')
      .select('*')
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `plataforma_utilizada.ilike.%${q}%,responsavel.ilike.%${q}%,municipio_beneficiado.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar vaquinhas.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar vaquinhas.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validateVaquinha(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('vaquinhas_online').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar vaquinha.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vaquinha cadastrada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar vaquinha.' }, { status: 500 })
  }
}