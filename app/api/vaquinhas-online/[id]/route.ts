import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateVaquinha } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateVaquinha(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('vaquinhas_online')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar vaquinha.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vaquinha atualizada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar vaquinha.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('vaquinhas_online')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover vaquinha.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vaquinha removida com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover vaquinha.' }, { status: 500 })
  }
}