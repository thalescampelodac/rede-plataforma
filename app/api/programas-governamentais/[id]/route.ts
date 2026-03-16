import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validatePrograma } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validatePrograma(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('programas_governamentais')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar programa.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Programa atualizado com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar programa.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('programas_governamentais')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover programa.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Programa removido com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover programa.' }, { status: 500 })
  }
}