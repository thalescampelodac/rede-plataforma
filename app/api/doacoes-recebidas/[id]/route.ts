import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateDoacao } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateDoacao(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('doacoes_recebidas')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar doação.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Doação atualizada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar doação.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('doacoes_recebidas')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover doação.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Doação removida com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover doação.' }, { status: 500 })
  }
}