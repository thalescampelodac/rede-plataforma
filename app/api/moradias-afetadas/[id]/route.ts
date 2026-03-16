import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateMoradia } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateMoradia(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('moradias_afetadas')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar moradia.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Moradia atualizada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar moradia.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('moradias_afetadas')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover moradia.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Moradia removida com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover moradia.' }, { status: 500 })
  }
}