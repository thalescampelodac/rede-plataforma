import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateEstoque } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateEstoque(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('estoque_humanitario')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar item de estoque.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item de estoque atualizado com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar item de estoque.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('estoque_humanitario')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover item de estoque.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item de estoque removido com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover item de estoque.' }, { status: 500 })
  }
}