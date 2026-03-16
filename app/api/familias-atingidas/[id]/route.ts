import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateFamilia } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateFamilia(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existing } = await supabase
      .from('familias_atingidas')
      .select('id')
      .eq('cpf', normalized.cpf)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'Já existe outro cadastro com esse CPF.', errors: { cpf: 'CPF já cadastrado em outro registro.' } },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('familias_atingidas')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar família.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Família atualizada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar família.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('familias_atingidas')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover família.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Família removida com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover família.' }, { status: 500 })
  }
}