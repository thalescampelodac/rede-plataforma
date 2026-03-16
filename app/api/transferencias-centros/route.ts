import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateTransferencia } from '@/lib/validations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('transferencias_centros')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(
      `nome_item.ilike.%${q}%,centro_origem.ilike.%${q}%,centro_destino.ilike.%${q}%`
    )
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ message: 'Erro ao consultar transferências.' }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { valid, errors, normalized } = validateTransferencia(body)

  if (!valid) {
    return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('transferencias_centros')
    .insert([normalized])

  if (error) {
    return NextResponse.json({ message: 'Erro ao salvar transferência.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Transferência registrada com sucesso.' })
}