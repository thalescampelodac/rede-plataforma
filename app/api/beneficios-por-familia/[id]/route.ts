import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateBeneficio } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateBeneficio(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('beneficios_por_familia')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar benefício.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Benefício atualizado com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar benefício.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('beneficios_por_familia')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover benefício.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Benefício removido com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover benefício.' }, { status: 500 })
  }
}