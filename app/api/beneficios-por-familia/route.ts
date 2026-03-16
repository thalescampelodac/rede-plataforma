import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateBeneficio } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('beneficios_por_familia')
      .select(`
        *,
        familias_atingidas (
          id,
          nome_responsavel,
          cpf,
          municipio,
          estado
        ),
        programas_governamentais (
          id,
          nome_programa,
          esfera
        )
      `)
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `tipo_beneficio.ilike.%${q}%,orgao_pagador_distribuidor.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar benefícios.' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar benefícios.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validateBeneficio(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('beneficios_por_familia').insert([normalized])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar benefício.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Benefício cadastrado com sucesso.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar benefício.' }, { status: 500 })
  }
}