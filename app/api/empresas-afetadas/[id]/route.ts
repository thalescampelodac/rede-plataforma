import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateEmpresa } from '@/lib/validations'

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { valid, errors, normalized } = validateEmpresa(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existing } = await supabase
      .from('empresas_afetadas')
      .select('id')
      .eq('cnpj', normalized.cnpj)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'Já existe outra empresa com esse CNPJ.', errors: { cnpj: 'CNPJ já cadastrado em outro registro.' } },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('empresas_afetadas')
      .update(normalized)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar empresa.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Empresa atualizada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao atualizar empresa.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('empresas_afetadas')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Erro ao remover empresa.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Empresa removida com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao remover empresa.' }, { status: 500 })
  }
}