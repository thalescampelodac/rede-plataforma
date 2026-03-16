import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateEmpresa } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('empresas_afetadas')
      .select('*')
      .order('created_at', { ascending: false })

    if (q) {
      const digits = q.replace(/\D/g, '')
      query = query.or(
        `nome_empresa.ilike.%${q}%,cnpj.ilike.%${digits || q}%,municipio.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar empresas.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar empresas.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'Já existe uma empresa com esse CNPJ.', errors: { cnpj: 'CNPJ já cadastrado.' } },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('empresas_afetadas').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar empresa.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Empresa cadastrada com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar empresa.' }, { status: 500 })
  }
}